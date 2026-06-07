/**
 * Achievement / badge definitions.
 *
 * Each badge declares an `unlock` predicate over a rolled-up `PlayerStats`
 * snapshot. The gamification engine evaluates these — adding a badge is just
 * adding an entry here.
 */

export interface PlayerStats {
  totalCompletions: number;
  /** Count of completions per task category. */
  byCategory: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  /** Number of water tests that read fully in the ideal band. */
  balancedTests: number;
  /** Consecutive in-ideal pH tests over the last 7 days, computed upstream. */
  perfectPhWeek: boolean;
  seasonsOpened: number;
}

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  emoji: string;
  unlock: (s: PlayerStats) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: "first_test",
    title: "First Test",
    description: "Log your very first water test.",
    emoji: "🧪",
    unlock: (s) => (s.byCategory.test ?? 0) >= 1,
  },
  {
    key: "crystal_clear",
    title: "Crystal Clear",
    description: "Hit perfectly balanced water 5 times.",
    emoji: "💎",
    unlock: (s) => s.balancedTests >= 5,
  },
  {
    key: "filter_master",
    title: "Filter Master",
    description: "Clean or replace the filter 10 times.",
    emoji: "🧽",
    unlock: (s) => (s.byCategory.filter ?? 0) >= 10,
  },
  {
    key: "shock_therapy",
    title: "Shock Therapy",
    description: "Shock the water 4 times.",
    emoji: "⚡",
    unlock: (s) => (s.byCategory.shock ?? 0) >= 4,
  },
  {
    key: "season_opener",
    title: "Season Opener",
    description: "Open your hot tub for the season.",
    emoji: "🌅",
    unlock: (s) => s.seasonsOpened >= 1,
  },
  {
    key: "perfect_ph_week",
    title: "Perfect pH Week",
    description: "Keep pH in the ideal band for a whole week.",
    emoji: "🎯",
    unlock: (s) => s.perfectPhWeek,
  },
  {
    key: "streak_7",
    title: "On a Roll",
    description: "Reach a 7-day streak.",
    emoji: "🔥",
    unlock: (s) => s.longestStreak >= 7,
  },
  {
    key: "streak_30",
    title: "Hot Tub Hero",
    description: "Reach a 30-day streak.",
    emoji: "🏆",
    unlock: (s) => s.longestStreak >= 30,
  },
];
