import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, text, integer, boolean, real } from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username"),
  displayName: varchar("display_name"),
  usernameSet: boolean("username_set").default(false),
  role: varchar("role").default("user"),
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  accentColor: varchar("accent_color"),
  isDarkMode: boolean("is_dark_mode").default(true),
  favorites: jsonb("favorites").$type<string[]>().default([]),
  playHistory: jsonb("play_history").$type<string[]>().default([]),
  preferredCategories: jsonb("preferred_categories").$type<string[]>().default([]),
  gamerPersona: jsonb("gamer_persona").$type<{ title: string; description: string } | null>().default(null),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey(),
  plays: integer("plays").default(0),
  rating: real("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  totalRating: real("total_rating").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameRatings = pgTable("game_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  userId: varchar("user_id").notNull(),
  value: real("value").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameMods = pgTable("game_mods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  author: varchar("author"),
  authorId: varchar("author_id"),
  version: varchar("version").default("v1.0.0"),
  downloads: integer("downloads").default(0),
  rating: real("rating").default(5.0),
  thumbnail: varchar("thumbnail"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameRequests = pgTable("game_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  userEmail: varchar("user_email"),
  displayName: varchar("display_name"),
  gameName: varchar("game_name").notNull(),
  description: text("description"),
  link: varchar("link"),
  status: varchar("status").default("pending"),
  votes: integer("votes").default(0),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bugReports = pgTable("bug_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  email: varchar("email"),
  gameName: varchar("game_name"),
  description: text("description").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  email: varchar("email"),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameReports = pgTable("game_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  gameTitle: varchar("game_title"),
  userId: varchar("user_id"),
  reason: text("reason").notNull(),
  status: varchar("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  displayName: varchar("display_name").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type GameStats = typeof gameStats.$inferSelect;
export type GameMod = typeof gameMods.$inferSelect;
export type GameRequest = typeof gameRequests.$inferSelect;
export type BugReport = typeof bugReports.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
