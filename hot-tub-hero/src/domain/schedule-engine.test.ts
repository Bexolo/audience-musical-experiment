import {
  cadenceIntervalDays,
  dueTasks,
  generateScheduledTasks,
  nextDueDate,
  waterChangeIntervalDays,
} from "./schedule-engine";
import type { TaskCompletion, WaterBody } from "./types";

const tub: WaterBody = {
  id: "tub1",
  name: "Garden spa",
  type: "blowup_spa",
  volumeLitres: 900,
  sanitiser: "chlorine",
  dailyBathers: 2,
  inSeason: true,
  createdAt: "2026-06-01T00:00:00.000Z",
};

const completion = (templateKey: string, completedAt: string): TaskCompletion => ({
  templateKey,
  waterBodyId: tub.id,
  completedAt,
});

describe("waterChangeIntervalDays", () => {
  it("applies the volume / (3 × bathers) rule of thumb", () => {
    // 900 / (3 * 2) = 150 → clamped to the 90-day max
    expect(waterChangeIntervalDays(900, 2)).toBe(90);
    // 600 / (3 * 4) = 50
    expect(waterChangeIntervalDays(600, 4)).toBe(50);
  });

  it("clamps to the safe window and handles zero bathers", () => {
    expect(waterChangeIntervalDays(60, 5)).toBe(7); // 4 → min 7
    expect(waterChangeIntervalDays(300, 0)).toBe(90); // treats 0 as 1 bather
  });
});

describe("cadenceIntervalDays", () => {
  it("maps cadences to day intervals", () => {
    expect(cadenceIntervalDays({ kind: "daily" }, tub)).toBe(1);
    expect(cadenceIntervalDays({ kind: "everyNDays", n: 2 }, tub)).toBe(2);
    expect(cadenceIntervalDays({ kind: "weekly" }, tub)).toBe(7);
    expect(cadenceIntervalDays({ kind: "everyNWeeks", n: 2 }, tub)).toBe(14);
    expect(cadenceIntervalDays({ kind: "usageBased" }, tub)).toBe(90);
    expect(cadenceIntervalDays({ kind: "seasonal", phase: "open" }, tub)).toBeNull();
  });
});

describe("nextDueDate", () => {
  const now = new Date("2026-06-10T09:00:00.000Z");

  it("is due today when never completed", () => {
    const due = nextDueDate(null, { kind: "weekly" }, tub, now);
    expect(due).not.toBeNull();
    expect(due!.getFullYear()).toBe(2026);
    expect(due!.getMonth()).toBe(5); // June
    expect(due!.getDate()).toBe(10);
  });

  it("adds the interval to the last completion", () => {
    const last = new Date("2026-06-08T18:00:00.000Z");
    const due = nextDueDate(last, { kind: "everyNDays", n: 2 }, tub, now);
    expect(due!.getDate()).toBe(10);
  });

  it("anchors seasonal open to season start and gives close no auto date", () => {
    expect(nextDueDate(null, { kind: "seasonal", phase: "open" }, tub, now)).not.toBeNull();
    expect(nextDueDate(null, { kind: "seasonal", phase: "close" }, tub, now)).toBeNull();
  });
});

describe("generateScheduledTasks", () => {
  const now = new Date("2026-06-10T09:00:00.000Z");

  it("creates one task per applicable template, most urgent first", () => {
    const tasks = generateScheduledTasks(tub, [], now);
    expect(tasks.length).toBeGreaterThan(0);
    // no seasonal-close task is auto-listed
    expect(tasks.find((t) => t.templateKey === "season_close")).toBeUndefined();
    // sorted ascending by due date
    const dates = tasks.map((t) => new Date(t.dueDate).getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
  });

  it("marks a task done when completed today and overdue when past due", () => {
    const completions = [
      completion("test_water", now.toISOString()), // done today
      completion("shock_water", "2026-05-20T10:00:00.000Z"), // long overdue
    ];
    const tasks = generateScheduledTasks(tub, completions, now);
    expect(tasks.find((t) => t.templateKey === "test_water")!.status).toBe("done");
    expect(tasks.find((t) => t.templateKey === "shock_water")!.status).toBe("overdue");
  });

  it("drops a completed seasonal open task", () => {
    const completions = [completion("season_open", "2026-06-01T10:00:00.000Z")];
    const tasks = generateScheduledTasks(tub, completions, now);
    expect(tasks.find((t) => t.templateKey === "season_open")).toBeUndefined();
  });
});

describe("dueTasks", () => {
  it("returns only tasks due now and not done", () => {
    const now = new Date("2026-06-10T09:00:00.000Z");
    const due = dueTasks(tub, [], now);
    // everything is due today on a fresh tub
    expect(due.every((t) => t.status !== "done")).toBe(true);
    expect(due.length).toBeGreaterThan(0);
  });
});
