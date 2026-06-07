/**
 * Typed data-access layer over Drizzle. Maps SQLite rows to/from the domain
 * types so the rest of the app never touches raw rows.
 */
import { desc, eq } from "drizzle-orm";
import type {
  TaskCompletion,
  WaterBody,
  WaterTest,
} from "@/domain/types";
import { db } from "./client";
import {
  settings,
  taskCompletions,
  userAchievements,
  waterBodies,
  waterTests,
  type WaterBodyRow,
} from "./schema";

function rowToWaterBody(r: WaterBodyRow): WaterBody {
  return {
    id: r.id,
    name: r.name,
    type: r.type as WaterBody["type"],
    volumeLitres: r.volumeLitres,
    sanitiser: r.sanitiser as WaterBody["sanitiser"],
    dailyBathers: r.dailyBathers,
    inSeason: r.inSeason,
    createdAt: r.createdAt,
  };
}

export async function getActiveWaterBody(): Promise<WaterBody | null> {
  const rows = await db.select().from(waterBodies).limit(1);
  return rows[0] ? rowToWaterBody(rows[0]) : null;
}

export async function createWaterBody(input: WaterBody): Promise<void> {
  await db.insert(waterBodies).values({
    id: input.id,
    name: input.name,
    type: input.type,
    volumeLitres: input.volumeLitres,
    sanitiser: input.sanitiser,
    dailyBathers: input.dailyBathers,
    inSeason: input.inSeason,
    createdAt: input.createdAt,
  });
}

export async function setInSeason(id: string, inSeason: boolean): Promise<void> {
  await db.update(waterBodies).set({ inSeason }).where(eq(waterBodies.id, id));
}

export async function listCompletions(bodyId: string): Promise<TaskCompletion[]> {
  const rows = await db
    .select()
    .from(taskCompletions)
    .where(eq(taskCompletions.waterBodyId, bodyId));
  return rows.map((r) => ({
    templateKey: r.templateKey,
    waterBodyId: r.waterBodyId,
    completedAt: r.completedAt,
  }));
}

export async function addCompletion(c: TaskCompletion): Promise<void> {
  await db.insert(taskCompletions).values(c);
}

export async function listWaterTests(bodyId: string): Promise<WaterTest[]> {
  const rows = await db
    .select()
    .from(waterTests)
    .where(eq(waterTests.waterBodyId, bodyId))
    .orderBy(desc(waterTests.takenAt));
  return rows.map((r) => ({
    waterBodyId: r.waterBodyId,
    takenAt: r.takenAt,
    sanitiserPpm: r.sanitiserPpm,
    ph: r.ph,
    alkalinityPpm: r.alkalinityPpm,
  }));
}

export async function addWaterTest(t: WaterTest): Promise<void> {
  await db.insert(waterTests).values(t);
}

export async function listUnlockedAchievements(): Promise<string[]> {
  const rows = await db.select().from(userAchievements);
  return rows.map((r) => r.key);
}

export async function unlockAchievements(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const now = new Date().toISOString();
  await db
    .insert(userAchievements)
    .values(keys.map((key) => ({ key, unlockedAt: now })))
    .onConflictDoNothing();
}

export async function getSetting(key: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}
