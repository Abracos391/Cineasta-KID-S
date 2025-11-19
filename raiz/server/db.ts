import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  avatars, 
  InsertAvatar,
  stories,
  InsertStory,
  chapters,
  InsertChapter,
  storyCharacters,
  InsertStoryCharacter,
  characterAudios,
  InsertCharacterAudio,
  classrooms,
  InsertClassroom,
  classroomStudents,
  InsertClassroomStudent,
  classroomStories,
  InsertClassroomStory
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER QUERIES =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserSubscription(userId: number, plan: "free" | "premium", expiresAt?: Date) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users)
    .set({ 
      subscriptionPlan: plan,
      subscriptionExpiresAt: expiresAt 
    })
    .where(eq(users.id, userId));
}

// ============= AVATAR QUERIES =============

export async function createAvatar(avatar: InsertAvatar) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(avatars).values(avatar);
  return result;
}

export async function getUserAvatars(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(avatars)
    .where(eq(avatars.userId, userId))
    .orderBy(desc(avatars.createdAt));
}

export async function getAvatarById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(avatars).where(eq(avatars.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteAvatar(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(avatars).where(and(eq(avatars.id, id), eq(avatars.userId, userId)));
}

// ============= STORY QUERIES =============

export async function createStory(story: InsertStory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(stories).values(story);
  return result;
}

export async function getUserStories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(stories)
    .where(eq(stories.userId, userId))
    .orderBy(desc(stories.createdAt));
}

export async function getStoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(stories).where(eq(stories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateStory(id: number, updates: Partial<InsertStory>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(stories).set(updates).where(eq(stories.id, id));
}

export async function deleteStory(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(stories).where(and(eq(stories.id, id), eq(stories.userId, userId)));
}

// ============= CHAPTER QUERIES =============

export async function createChapter(chapter: InsertChapter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(chapters).values(chapter);
  return result;
}

export async function getStoryChapters(storyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(chapters)
    .where(eq(chapters.storyId, storyId))
    .orderBy(chapters.chapterNumber);
}

export async function updateChapter(id: number, updates: Partial<InsertChapter>) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(chapters).set(updates).where(eq(chapters.id, id));
}

// ============= STORY CHARACTER QUERIES =============

export async function addStoryCharacter(character: InsertStoryCharacter) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(storyCharacters).values(character);
  return result;
}

export async function getStoryCharacters(storyId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(storyCharacters)
    .where(eq(storyCharacters.storyId, storyId));
}

// ============= CHARACTER AUDIO QUERIES =============

export async function addCharacterAudio(audio: InsertCharacterAudio) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(characterAudios).values(audio);
  return result;
}

export async function getCharacterAudios(storyCharacterId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(characterAudios)
    .where(eq(characterAudios.storyCharacterId, storyCharacterId));
}

// ============= CLASSROOM QUERIES =============

export async function createClassroom(classroom: InsertClassroom) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(classrooms).values(classroom);
  return result;
}

export async function getTeacherClassrooms(teacherId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(classrooms)
    .where(eq(classrooms.teacherId, teacherId))
    .orderBy(desc(classrooms.createdAt));
}

export async function addStudentToClassroom(student: InsertClassroomStudent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(classroomStudents).values(student);
  return result;
}

export async function shareStoryWithClassroom(share: InsertClassroomStory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(classroomStories).values(share);
  return result;
}
