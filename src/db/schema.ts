/**
 * Drizzle schema — the on-device SQLite source of truth.
 *
 * Only *user* data lives here. Reference catalogues (chemicals, tools, schedule
 * templates, achievement defs) are bundled code/JSON, not tables, so they ship
 * with the app and update over-the-air.
 */
import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const waterBodies = sqliteTable("water_bodies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  volumeLitres: integer("volume_litres").notNull(),
  sanitiser: text("sanitiser").notNull(),
  dailyBathers: integer("daily_bathers").notNull().default(2),
  inSeason: integer("in_season", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const taskCompletions = sqliteTable("task_completions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  waterBodyId: text("water_body_id").notNull(),
  templateKey: text("template_key").notNull(),
  completedAt: text("completed_at").notNull(),
});

export const waterTests = sqliteTable("water_tests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  waterBodyId: text("water_body_id").notNull(),
  takenAt: text("taken_at").notNull(),
  sanitiserPpm: real("sanitiser_ppm").notNull(),
  ph: real("ph").notNull(),
  alkalinityPpm: real("alkalinity_ppm").notNull(),
});

export const userAchievements = sqliteTable("user_achievements", {
  key: text("key").primaryKey(),
  unlockedAt: text("unlocked_at").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type WaterBodyRow = typeof waterBodies.$inferSelect;
export type TaskCompletionRow = typeof taskCompletions.$inferSelect;
export type WaterTestRow = typeof waterTests.$inferSelect;
