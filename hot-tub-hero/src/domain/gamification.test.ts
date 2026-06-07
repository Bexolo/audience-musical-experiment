import type { PlayerStats } from "@/data/achievements";
import {
  computeStreak,
  evaluateAchievements,
  levelInfo,
  newlyUnlocked,
  totalXp,
  xpForCategory,
} from "./gamification";
import type { TaskCompletion } from "./types";

const c = (templateKey: string, completedAt: string): TaskCompletion => ({
  templateKey,
  waterBodyId: "tub1",
  completedAt,
});

describe("computeStreak", () => {
  const now = new Date("2026-06-10T20:00:00.000Z");

  it("counts consecutive days ending today", () => {
    const s = computeStreak(
      [c("test_water", "2026-06-08T10:00:00.000Z"),
       c("test_water", "2026-06-09T10:00:00.000Z"),
       c("shock_water", "2026-06-10T10:00:00.000Z")],
      now
    );
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
    expect(s.atRisk).toBe(false);
  });

  it("keeps the streak alive but flags risk when today is pending", () => {
    const s = computeStreak(
      [c("test_water", "2026-06-08T10:00:00.000Z"),
       c("test_water", "2026-06-09T10:00:00.000Z")],
      now
    );
    expect(s.current).toBe(2);
    expect(s.atRisk).toBe(true);
  });

  it("resets to zero once a day is missed", () => {
    const s = computeStreak(
      [c("test_water", "2026-06-05T10:00:00.000Z")],
      now
    );
    expect(s.current).toBe(0);
    expect(s.longest).toBe(1);
  });

  it("handles an empty history", () => {
    expect(computeStreak([], now)).toEqual({ current: 0, longest: 0, atRisk: false });
  });
});

describe("levelInfo", () => {
  it("starts at level 1 with no XP", () => {
    const l = levelInfo(0);
    expect(l.level).toBe(1);
    expect(l.xpForNextLevel).toBe(100);
    expect(l.progress).toBe(0);
  });

  it("levels up on the cumulative curve (100, 300, 600...)", () => {
    expect(levelInfo(99).level).toBe(1);
    expect(levelInfo(100).level).toBe(2);
    expect(levelInfo(300).level).toBe(3);
    expect(levelInfo(600).level).toBe(4);
  });

  it("reports progress within the current level", () => {
    const l = levelInfo(150); // level 2 needs 200 more (cost 200), 50 in
    expect(l.level).toBe(2);
    expect(l.xpIntoLevel).toBe(50);
    expect(l.progress).toBeCloseTo(50 / 200);
  });
});

describe("xp", () => {
  it("awards more XP for rare, important chores", () => {
    expect(xpForCategory("water_change")).toBeGreaterThan(xpForCategory("sanitise"));
    expect(xpForCategory("unknown")).toBe(5);
  });

  it("totals XP across a history", () => {
    const categoryOf = (key: string) =>
      key === "water_change" ? "water_change" : "test";
    const xp = totalXp([c("water_change", "x"), c("test_water", "y")], categoryOf);
    expect(xp).toBe(xpForCategory("water_change") + xpForCategory("test"));
  });
});

describe("achievements", () => {
  const base: PlayerStats = {
    totalCompletions: 0,
    byCategory: {},
    currentStreak: 0,
    longestStreak: 0,
    balancedTests: 0,
    perfectPhWeek: false,
    seasonsOpened: 0,
  };

  it("unlocks First Test after one test", () => {
    expect(evaluateAchievements({ ...base, byCategory: { test: 1 } })).toContain("first_test");
  });

  it("unlocks streak badges at thresholds", () => {
    expect(evaluateAchievements({ ...base, longestStreak: 7 })).toContain("streak_7");
    expect(evaluateAchievements({ ...base, longestStreak: 30 })).toContain("streak_30");
    expect(evaluateAchievements({ ...base, longestStreak: 6 })).not.toContain("streak_7");
  });

  it("reports only newly-unlocked badges", () => {
    const stats = { ...base, byCategory: { test: 1 }, longestStreak: 7 };
    const fresh = newlyUnlocked(stats, ["first_test"]);
    expect(fresh).toContain("streak_7");
    expect(fresh).not.toContain("first_test");
  });
});
