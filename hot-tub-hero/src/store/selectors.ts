/**
 * Pure derivations from store state → the numbers the UI shows. Kept separate
 * from the store (and free of store imports) so they stay easy to reason about
 * and could be unit-tested in isolation.
 */
import type { PlayerStats } from "@/data/achievements";
import { getTargets } from "@/data/targets";
import {
  computeStreak,
  levelInfo,
  totalXp,
  type LevelInfo,
  type StreakInfo,
} from "@/domain/gamification";
import { waterHealthScore, type HealthScore } from "@/domain/health-score";
import {
  findTaskTemplate,
  generateScheduledTasks,
} from "@/domain/schedule-engine";
import type {
  ScheduledTask,
  TaskCompletion,
  WaterBody,
  WaterTest,
} from "@/domain/types";

/** The slice of store state these selectors need. */
export interface DerivableState {
  waterBody: WaterBody | null;
  completions: TaskCompletion[];
  waterTests: WaterTest[];
}

function categoryOf(waterBody: WaterBody, templateKey: string): string {
  return findTaskTemplate(waterBody, templateKey)?.category ?? "inspect";
}

function isBalanced(t: WaterTest, waterBody: WaterBody): boolean {
  const tg = getTargets(waterBody.type, waterBody.sanitiser);
  const within = (v: number, r: { idealMin: number; idealMax: number }) =>
    v >= r.idealMin && v <= r.idealMax;
  return (
    within(t.sanitiserPpm, tg.sanitiser) &&
    within(t.ph, tg.ph) &&
    within(t.alkalinityPpm, tg.alkalinity)
  );
}

export function buildPlayerStats(state: DerivableState): PlayerStats {
  const { waterBody, completions, waterTests } = state;
  if (!waterBody) {
    return {
      totalCompletions: 0,
      byCategory: {},
      currentStreak: 0,
      longestStreak: 0,
      balancedTests: 0,
      perfectPhWeek: false,
      seasonsOpened: 0,
    };
  }

  const byCategory: Record<string, number> = {};
  for (const c of completions) {
    const cat = categoryOf(waterBody, c.templateKey);
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }

  const streak = computeStreak(completions);
  const balancedTests = waterTests.filter((t) => isBalanced(t, waterBody)).length;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const tg = getTargets(waterBody.type, waterBody.sanitiser);
  const recentTests = waterTests.filter((t) => new Date(t.takenAt).getTime() >= weekAgo);
  const perfectPhWeek =
    recentTests.length > 0 &&
    recentTests.every((t) => t.ph >= tg.ph.idealMin && t.ph <= tg.ph.idealMax);

  return {
    totalCompletions: completions.length,
    byCategory,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    balancedTests,
    perfectPhWeek,
    seasonsOpened: byCategory.season ?? 0,
  };
}

export interface Dashboard {
  tasks: ScheduledTask[];
  dueCount: number;
  health: HealthScore;
  streak: StreakInfo;
  level: LevelInfo;
  xp: number;
}

export function buildDashboard(
  state: DerivableState,
  now: Date = new Date()
): Dashboard | null {
  const { waterBody, completions, waterTests } = state;
  if (!waterBody) return null;

  const tasks = generateScheduledTasks(waterBody, completions, now);
  const active = tasks.filter((t) => t.status !== "done");
  const overdue = active.filter((t) => t.status === "overdue").length;
  // Adherence: share of currently-active tasks that aren't overdue.
  const adherence = active.length === 0 ? 1 : 1 - overdue / active.length;

  const targets = getTargets(waterBody.type, waterBody.sanitiser);
  const latestTest = waterTests[0] ?? null;
  const health = waterHealthScore(latestTest, targets, adherence);

  const streak = computeStreak(completions, now);
  const xp = totalXp(completions, (key) => categoryOf(waterBody, key));
  const level = levelInfo(xp);

  return {
    tasks,
    dueCount: active.filter((t) => new Date(t.dueDate).getTime() <= now.getTime()).length,
    health,
    streak,
    level,
    xp,
  };
}
