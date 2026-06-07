/**
 * SQLite + Drizzle client and one-time schema bootstrap.
 *
 * v1 keeps migrations simple: a single idempotent `CREATE TABLE IF NOT EXISTS`
 * bootstrap run at startup. When the schema starts evolving, swap this for
 * drizzle-kit generated migrations applied via `useMigrations`.
 */
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("hottubhero.db");
export const db = drizzle(expoDb, { schema });

export function initDatabase(): void {
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS water_bodies (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      volume_litres INTEGER NOT NULL,
      sanitiser TEXT NOT NULL,
      daily_bathers INTEGER NOT NULL DEFAULT 2,
      in_season INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
    CREATE TABLE IF NOT EXISTS task_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      water_body_id TEXT NOT NULL,
      template_key TEXT NOT NULL,
      completed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS water_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      water_body_id TEXT NOT NULL,
      taken_at TEXT NOT NULL,
      sanitiser_ppm REAL NOT NULL,
      ph REAL NOT NULL,
      alkalinity_ppm REAL NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_achievements (
      key TEXT PRIMARY KEY NOT NULL,
      unlocked_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_completions_body ON task_completions (water_body_id);
    CREATE INDEX IF NOT EXISTS idx_tests_body ON water_tests (water_body_id);
  `);
}
