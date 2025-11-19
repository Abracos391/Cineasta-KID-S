import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { storagePut } from "./storage";
import { generateImage } from "./_core/imageGeneration";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";

// Helper para gerar sufixo aleatório para evitar enumeração
function randomSuffix() {
  return Math.random().toString(36).substring(2, 15);
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= AVATAR ROUTES =============
  avatar: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAvatars(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAvatarById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        photoBase64: z.string(),
        photoMimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Upload da foto original para S3
        const photoBuffer = Buffer.from(input.photoBase64, 'base64');
        const photoExt = input.photoMimeType.split('/')[1] || 'jpg';
        const photoKey = `${ctx.user.id}/photos/original-${randomSuffix()}.${photoExt}`;
        const { url: photoUrl } = await storagePut(photoKey, photoBuffer, input.photoMimeType);

        // Gerar avatar caricatural com IA
        const prompt = `Create a fun, colorful, cartoon-style caricature avatar suitable for children's stories. Style inspired by "The Amazing World of Gumball" - vibrant colors, exaggerated features, friendly and playful appearance. Based on the uploaded photo, create a character that would fit perfectly in a children's animated show.`;
        
        const { url: avatarUrl } = await generateImage({
          prompt,
          originalImages: [{
            url: photoUrl,
            mimeType: input.photoMimeType
          }]
        });

        // Baixar a imagem gerada e fazer upload para nosso S3
        if (!avatarUrl) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate avatar image' });
        }
        const avatarResponse = await fetch(avatarUrl);
        const avatarBuffer = Buffer.from(await avatarResponse.arrayBuffer());
        const avatarKey = `${ctx.user.id}/avatars/avatar-${randomSuffix()}.png`;
        const { url: finalAvatarUrl } = await storagePut(avatarKey, avatarBuffer, 'image/png');

        // Salvar no banco de dados
        await db.createAvatar({
          userId: ctx.user.id,
          name: input.name,
          originalPhotoUrl: photoUrl,
          originalPhotoKey: photoKey,
          avatarImageUrl: finalAvatarUrl,
          avatarImageKey: avatarKey,
          generationPrompt: prompt,
          isPublic: false,
        });

        return { success: true, avatarUrl: finalAvatarUrl };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAvatar(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============= STORY ROUTES =============
  story: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserStories(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const story = await db.getStoryById(input.id);
        if (!story) return null;

        const chapters = await db.getStoryChapters(input.id);
        const characters = await db.getStoryCharacters(input.id);

        return { story, chapters, characters };
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        theme: z.string(),
        targetAge: z.number().optional(),
        educationalGoal: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createStory({
          userId: ctx.user.id,
          title: input.title,
          theme: input.theme,
          targetAge: input.targetAge,
          educationalGoal: input.educationalGoal,
          status: "draft",
          isPublic: false,
        });

        return { success: true, storyId: Number((result as any).insertId) };
      }),

    generateScript: protectedProcedure
      .input(z.object({
        storyId: z.number(),
        characterIds: z.array(z.number()),
        numberOfChapters: z.number().min(1).max(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const story = await db.getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Story not found' });
        }

        // Buscar informações dos avatares
        const avatars = await Promise.all(
          input.characterIds.map(id => db.getAvatarById(id))
        );

        const characterDescriptions = avatars
          .filter(a => a !== undefined)
          .map((a, i) => `Character ${i + 1}: ${a!.name}`)
          .join(', ');

        // Atualizar status para "generating"
        await db.updateStory(input.storyId, { status: "generating" });

        // Gerar roteiro com IA
        const prompt = `You are a creative children's story writer. Create an educational and entertaining story with the following details:

Title: ${story.title}
Theme: ${story.theme}
Target Age: ${story.targetAge || 'general children audience'}
Educational Goal: ${story.educationalGoal || 'entertainment and moral lessons'}
Number of Chapters: ${input.numberOfChapters}
Characters: ${characterDescriptions}

Create a complete story script in JSON format with the following structure:
{
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter title",
      "content": "The story content for this chapter with dialogue and narration",
      "narratorText": "Summary or key narration points"
    }
  ]
}

Make the story engaging, age-appropriate, colorful, and inspired by the playful style of "The Amazing World of Gumball". Include dialogue between characters and descriptive narration.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a creative children's story writer specialized in educational and entertaining content." },
            { role: "user", content: prompt }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "story_script",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  chapters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        chapterNumber: { type: "integer" },
                        title: { type: "string" },
                        content: { type: "string" },
                        narratorText: { type: "string" }
                      },
                      required: ["chapterNumber", "title", "content", "narratorText"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["chapters"],
                additionalProperties: false
              }
            }
          }
        });

        const messageContent = response.choices[0]?.message.content;
        const contentString = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
        const scriptData = JSON.parse(contentString || '{"chapters":[]}');

        // Salvar capítulos no banco
        for (const chapter of scriptData.chapters) {
          await db.createChapter({
            storyId: input.storyId,
            chapterNumber: chapter.chapterNumber,
            title: chapter.title,
            content: chapter.content,
            narratorText: chapter.narratorText,
          });
        }

        // Adicionar personagens à história
        for (let i = 0; i < input.characterIds.length; i++) {
          const avatar = avatars[i];
          if (avatar) {
            await db.addStoryCharacter({
              storyId: input.storyId,
              avatarId: input.characterIds[i]!,
              characterName: avatar.name,
              characterRole: i === 0 ? "protagonist" : "supporting",
              characterDescription: `Character based on avatar ${avatar.name}`,
            });
          }
        }

        // Atualizar status para "completed"
        await db.updateStory(input.storyId, { status: "completed" });

        return { success: true };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        storyId: z.number(),
        status: z.enum(["draft", "generating", "completed", "published"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const story = await db.getStoryById(input.storyId);
        if (!story || story.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Story not found' });
        }

        await db.updateStory(input.storyId, { status: input.status });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteStory(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============= AUDIO ROUTES =============
  audio: router({
    uploadAndTranscribe: protectedProcedure
      .input(z.object({
        storyCharacterId: z.number(),
        chapterId: z.number().optional(),
        audioBase64: z.string(),
        audioMimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Upload do áudio para S3
        const audioBuffer = Buffer.from(input.audioBase64, 'base64');
        const audioExt = input.audioMimeType.split('/')[1] || 'mp3';
        const audioKey = `${ctx.user.id}/audios/audio-${randomSuffix()}.${audioExt}`;
        const { url: audioUrl } = await storagePut(audioKey, audioBuffer, input.audioMimeType);

        // Transcrever áudio
        let transcription = '';
        try {
          const transcriptionResult = await transcribeAudio({
            audioUrl,
            language: 'pt',
          });
          if ('text' in transcriptionResult) {
            transcription = transcriptionResult.text;
          }
        } catch (error) {
          console.error('Transcription failed:', error);
        }

        // Calcular duração aproximada (em segundos)
        const duration = Math.floor(audioBuffer.length / 16000); // Aproximação

        // Salvar no banco
        await db.addCharacterAudio({
          storyCharacterId: input.storyCharacterId,
          chapterId: input.chapterId,
          audioUrl,
          audioKey,
          duration,
          transcription,
        });

        return { success: true, audioUrl, transcription };
      }),

    getByCharacter: protectedProcedure
      .input(z.object({ storyCharacterId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCharacterAudios(input.storyCharacterId);
      }),
  }),

  // ============= CLASSROOM ROUTES (para professores) =============
  classroom: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTeacherClassrooms(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        gradeLevel: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await db.createClassroom({
          teacherId: ctx.user.id,
          name: input.name,
          description: input.description,
          gradeLevel: input.gradeLevel,
          isActive: true,
        });

        return { success: true, classroomId: Number((result as any).insertId) };
      }),

    addStudent: protectedProcedure
      .input(z.object({
        classroomId: z.number(),
        studentName: z.string(),
        studentCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.addStudentToClassroom({
          classroomId: input.classroomId,
          studentName: input.studentName,
          studentCode: input.studentCode,
        });

        return { success: true };
      }),

    shareStory: protectedProcedure
      .input(z.object({
        classroomId: z.number(),
        storyId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.shareStoryWithClassroom({
          classroomId: input.classroomId,
          storyId: input.storyId,
        });

        return { success: true };
      }),
  }),

  // ============= USER SUBSCRIPTION ROUTES =============
  subscription: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      const isActive = user.subscriptionPlan === 'premium' && 
                      (!user.subscriptionExpiresAt || user.subscriptionExpiresAt > new Date());

      return {
        plan: user.subscriptionPlan,
        expiresAt: user.subscriptionExpiresAt,
        isActive,
      };
    }),

    upgrade: protectedProcedure
      .input(z.object({
        plan: z.enum(["premium"]),
        durationMonths: z.number().min(1).max(12),
      }))
      .mutation(async ({ ctx, input }) => {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + input.durationMonths);

        await db.updateUserSubscription(ctx.user.id, input.plan, expiresAt);

        return { success: true, expiresAt };
      }),
  }),
});

export type AppRouter = typeof appRouter;
