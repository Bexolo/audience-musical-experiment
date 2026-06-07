/**
 * Gamification engine — streaks, XP/levels and achievement evaluation.
 *
 * All pure functions over completion history + a rolled-up stats snapshot, so
 * the reward logic is fully unit-testable and the UI just renders the results.
 */
import { ACHIEVEMENTS, type PlayerStats } from "@/data/achievements";
import { daysBetween, startOfDay } from "./dates";
import type { TaskCompletion } from "./types";

export interface StreakInfo {
  current: number;
  longest: number;
  /** True when yesterday counted but nothing's been done today yet. */
  atRisk: boolean;
}

/** Unique day-keys (local midnight ms) that have at least one completion. */
function completionDayset(completions: TaskCompletion[]): Set<number> {
  const days = new Set<number>();
  for (const c of completions) {
    days.add(startOfDay(new Date(c.completedAt)).getTime());
  }
  return days;
}

/**
 * Daily streak: consecutive calendar days, counting back from today, on which
 * at least one task was completed. A streak survives if today is still pending
 * but yesterday counted (reported via `atRisk`).
 */
export function computeStreak(
  completions: TaskCompletion[],
  now: Date = new Date()
): StreakInfo {
  const days = completionDayset(completions);
  if (days.size === 0) return { current: 0, longest: 0, atRisk: false };

  const today = startOfDay(now);
  const doneToday = days.has(today.getTime());

  // Anchor the current run at today (if done) else yesterday (still alive).
  let current = 0;
  let cursor = doneToday ? today : startOfDay(new Date(today.getTime() - 86400000));
  while (days.has(cursor.getTime())) {
    current += 1;
    cursor = startOfDay(new Date(cursor.getTime() - 86400000));
  }

  // Longest run anywhere in history.
  const sorted = [...days].sort((a, b) => a - b);
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(new Date(sorted[i - 1]), new Date(sorted[i]));
    run = gap === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  return { current, longest: Math.max(longest, current), atRisk: !doneToday && current > 0 };
}

/** XP awarded per task category — riskier/rarer chores are worth more. */
export const XP_BY_CATEGORY: Record<string, number> = {
  test: 10,
  sanitise: 5,
  balance: 10,
  shock: 15,
  filter: 15,
  clean: 8,
  water_change: 40,
  inspect: 5,
  season: 50,
};

export function xpForCategory(category: string): number {
  return XP_BY_CATEGORY[category] ?? 5;
}

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  /** 0–1 progress toward the next level. */
  progress: number;
}

/**
 * Level curve: level N requires a cumulative `100 * N * (N+1) / 2` XP, i.e.
 * each level costs 100 XP more than the last (100, 300, 600, 1000, ...).
 */
export function levelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let level = 1;
  let cost = 100;
  let consumed = 0;
  while (safeXp >= consumed + cost) {
    consumed += cost;
    level += 1;
    cost += 100;
  }
  return {
    level,
    xpIntoLevel: safeXp - consumed,
    xpForNextLevel: cost,
    progress: (safeXp - consumed) / cost,
  };
}

/** Total XP from a completion history. */
export function totalXp(completions: TaskCompletion[], categoryOf: (key: string) => string | undefined): number {
  return completions.reduce((sum, c) => {
    const cat = categoryOf(c.templateKey);
    return sum + (cat ? xpForCategory(cat) : 5);
  }, 0);
}

/** Keys of every achievement currently unlocked by the given stats. */
export function evaluateAchievements(stats: PlayerStats): string[] {
  return ACHIEVEMENTS.filter((a) => a.unlock(stats)).map((a) => a.key);
}

/**
 * Newly-unlocked achievements: those true now that weren't already recorded.
 * Used to fire the celebration animation exactly once.
 */
export function newlyUnlocked(
  stats: PlayerStats,
  alreadyUnlocked: string[]
): string[] {
  const have = new Set(alreadyUnlocked);
  return evaluateAchievements(stats).filter((k) => !have.has(k));
}
