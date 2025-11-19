import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role and subscription fields for CINEASTA KID'S
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "teacher"]).default("user").notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "premium"]).default("free").notNull(),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Avatares caricaturais gerados a partir de fotos dos usuários
 */
export const avatars = mysqlTable("avatars", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  originalPhotoUrl: text("originalPhotoUrl").notNull(),
  originalPhotoKey: text("originalPhotoKey").notNull(),
  avatarImageUrl: text("avatarImageUrl").notNull(),
  avatarImageKey: text("avatarImageKey").notNull(),
  generationPrompt: text("generationPrompt"),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Avatar = typeof avatars.$inferSelect;
export type InsertAvatar = typeof avatars.$inferInsert;

/**
 * Histórias/roteiros gerados pela IA
 */
export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  theme: text("theme").notNull(),
  targetAge: int("targetAge"),
  educationalGoal: text("educationalGoal"),
  status: mysqlEnum("status", ["draft", "generating", "completed", "published"]).default("draft").notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  coverImageUrl: text("coverImageUrl"),
  coverImageKey: text("coverImageKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

/**
 * Capítulos das histórias
 */
export const chapters = mysqlTable("chapters", {
  id: int("id").autoincrement().primaryKey(),
  storyId: int("storyId").notNull(),
  chapterNumber: int("chapterNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  narratorText: text("narratorText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = typeof chapters.$inferInsert;

/**
 * Personagens (avatares) associados às histórias
 */
export const storyCharacters = mysqlTable("storyCharacters", {
  id: int("id").autoincrement().primaryKey(),
  storyId: int("storyId").notNull(),
  avatarId: int("avatarId").notNull(),
  characterName: varchar("characterName", { length: 255 }).notNull(),
  characterRole: mysqlEnum("characterRole", ["protagonist", "supporting", "extra"]).default("supporting").notNull(),
  characterDescription: text("characterDescription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StoryCharacter = typeof storyCharacters.$inferSelect;
export type InsertStoryCharacter = typeof storyCharacters.$inferInsert;

/**
 * Áudios gravados pelos usuários para os personagens
 */
export const characterAudios = mysqlTable("characterAudios", {
  id: int("id").autoincrement().primaryKey(),
  storyCharacterId: int("storyCharacterId").notNull(),
  chapterId: int("chapterId"),
  audioUrl: text("audioUrl").notNull(),
  audioKey: text("audioKey").notNull(),
  duration: int("duration"),
  transcription: text("transcription"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CharacterAudio = typeof characterAudios.$inferSelect;
export type InsertCharacterAudio = typeof characterAudios.$inferInsert;

/**
 * Turmas/classes para modo educacional (professores)
 */
export const classrooms = mysqlTable("classrooms", {
  id: int("id").autoincrement().primaryKey(),
  teacherId: int("teacherId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  gradeLevel: varchar("gradeLevel", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Classroom = typeof classrooms.$inferSelect;
export type InsertClassroom = typeof classrooms.$inferInsert;

/**
 * Alunos associados às turmas
 */
export const classroomStudents = mysqlTable("classroomStudents", {
  id: int("id").autoincrement().primaryKey(),
  classroomId: int("classroomId").notNull(),
  studentName: varchar("studentName", { length: 255 }).notNull(),
  studentCode: varchar("studentCode", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClassroomStudent = typeof classroomStudents.$inferSelect;
export type InsertClassroomStudent = typeof classroomStudents.$inferInsert;

/**
 * Histórias compartilhadas com turmas
 */
export const classroomStories = mysqlTable("classroomStories", {
  id: int("id").autoincrement().primaryKey(),
  classroomId: int("classroomId").notNull(),
  storyId: int("storyId").notNull(),
  sharedAt: timestamp("sharedAt").defaultNow().notNull(),
});

export type ClassroomStory = typeof classroomStories.$inferSelect;
export type InsertClassroomStory = typeof classroomStories.$inferInsert;
