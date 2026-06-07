/**
 * The app's single Zustand store. SQLite (via the repository) is the source of
 * truth; this store is the in-memory mirror the UI renders from. Mutations
 * write through to the DB, recompute gamification, and reschedule notifications.
 */
import { create } from "zustand";
import { PlayerStats } from "@/data/achievements";
import {
  evaluateAchievements,
  newlyUnlocked,
} from "@/domain/gamification";
import type {
  TaskCompletion,
  WaterBody,
  WaterTest,
} from "@/domain/types";
import * as repo from "@/db/repository";
import { rescheduleAll } from "@/notifications";
import { buildPlayerStats } from "./selectors";

interface AppState {
  ready: boolean;
  waterBody: WaterBody | null;
  completions: TaskCompletion[];
  waterTests: WaterTest[];
  unlockedAchievements: string[];
  /** Achievements unlocked since the last screen render, for the celebration. */
  pendingCelebrations: string[];

  load: () => Promise<void>;
  createTub: (input: WaterBody) => Promise<void>;
  completeTask: (templateKey: string) => Promise<void>;
  addTest: (test: Omit<WaterTest, "waterBodyId">) => Promise<void>;
  clearCelebrations: () => void;
  /** Persists newly-earned achievements and queues their celebration. */
  syncRewards: (stats: PlayerStats) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  waterBody: null,
  completions: [],
  waterTests: [],
  unlockedAchievements: [],
  pendingCelebrations: [],

  async load() {
    const waterBody = await repo.getActiveWaterBody();
    if (!waterBody) {
      set({ ready: true, waterBody: null });
      return;
    }
    const [completions, waterTests, unlockedAchievements] = await Promise.all([
      repo.listCompletions(waterBody.id),
      repo.listWaterTests(waterBody.id),
      repo.listUnlockedAchievements(),
    ]);
    set({ ready: true, waterBody, completions, waterTests, unlockedAchievements });
  },

  async createTub(input) {
    await repo.createWaterBody(input);
    set({ waterBody: input, completions: [], waterTests: [] });
    await rescheduleAll(input, []);
  },

  async completeTask(templateKey) {
    const { waterBody, completions } = get();
    if (!waterBody) return;
    const c: TaskCompletion = {
      templateKey,
      waterBodyId: waterBody.id,
      completedAt: new Date().toISOString(),
    };
    await repo.addCompletion(c);
    const next = [...completions, c];
    set({ completions: next });
    await get().syncRewards(buildPlayerStats(get()));
    await rescheduleAll(waterBody, next);
  },

  async addTest(test) {
    const { waterBody, waterTests } = get();
    if (!waterBody) return;
    const full: WaterTest = { ...test, waterBodyId: waterBody.id };
    await repo.addWaterTest(full);
    set({ waterTests: [full, ...waterTests] });
    await get().syncRewards(buildPlayerStats(get()));
  },

  clearCelebrations() {
    set({ pendingCelebrations: [] });
  },

  async syncRewards(stats) {
    const { unlockedAchievements } = get();
    const fresh = newlyUnlocked(stats, unlockedAchievements);
    if (fresh.length === 0) return;
    await repo.unlockAchievements(fresh);
    set({
      unlockedAchievements: evaluateAchievements(stats),
      pendingCelebrations: [...get().pendingCelebrations, ...fresh],
    });
  },
}));
