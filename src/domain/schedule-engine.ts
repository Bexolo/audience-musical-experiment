/**
 * Schedule engine — pure functions that turn a WaterBody + completion history
 * into the concrete tasks that drive the Today list, the calendar and the
 * notification scheduler. No I/O, no React, fully unit-testable.
 */
import { getScheduleTemplate } from "@/data/schedule-templates";
import { addDays, daysBetween, isSameDay, startOfDay, toISODate } from "./dates";
import type {
  Cadence,
  ScheduledTask,
  TaskCompletion,
  TaskTemplate,
  WaterBody,
} from "./types";

/** Sensible bounds so the usage-based water change never lands somewhere silly. */
export const WATER_CHANGE_MIN_DAYS = 7;
export const WATER_CHANGE_MAX_DAYS = 90;

/**
 * Beginner rule of thumb for a full water change:
 *   interval (days) ≈ volume (L) ÷ (3 × daily bathers)
 * Clamped to a safe 7–90 day window.
 */
export function waterChangeIntervalDays(
  volumeLitres: number,
  dailyBathers: number
): number {
  const bathers = Math.max(1, dailyBathers);
  const raw = Math.floor(volumeLitres / (3 * bathers));
  return Math.min(WATER_CHANGE_MAX_DAYS, Math.max(WATER_CHANGE_MIN_DAYS, raw));
}

/**
 * The recurrence interval, in days, for a cadence on a given water body.
 * Returns `null` for event-based (seasonal) cadences.
 */
export function cadenceIntervalDays(
  cadence: Cadence,
  waterBody: WaterBody
): number | null {
  switch (cadence.kind) {
    case "daily":
      return 1;
    case "everyNDays":
      return cadence.n;
    case "weekly":
      return 7;
    case "everyNWeeks":
      return cadence.n * 7;
    case "usageBased":
      return waterChangeIntervalDays(
        waterBody.volumeLitres,
        waterBody.dailyBathers
      );
    case "seasonal":
      return null;
  }
}

/**
 * The next date a recurring task is due. For a never-completed task it's due
 * today (so beginners aren't told to wait). Seasonal tasks return their phase
 * anchor: `open` is due at the season start; `close` has no auto date.
 */
export function nextDueDate(
  lastCompleted: Date | null,
  cadence: Cadence,
  waterBody: WaterBody,
  now: Date = new Date(),
  seasonStart: Date = new Date(waterBody.createdAt)
): Date | null {
  if (cadence.kind === "seasonal") {
    if (cadence.phase === "open") {
      return startOfDay(seasonStart);
    }
    return null; // close is user-triggered, not auto-scheduled
  }

  const interval = cadenceIntervalDays(cadence, waterBody);
  if (interval == null) return null;

  if (!lastCompleted) return startOfDay(now);
  return startOfDay(addDays(lastCompleted, interval));
}

/** Most recent completion datetime for a template key, or null. */
function lastCompletionFor(
  templateKey: string,
  completions: TaskCompletion[]
): Date | null {
  let latest: Date | null = null;
  for (const c of completions) {
    if (c.templateKey !== templateKey) continue;
    const d = new Date(c.completedAt);
    if (!latest || d > latest) latest = d;
  }
  return latest;
}

function statusFor(
  dueDate: Date,
  lastCompleted: Date | null,
  now: Date
): ScheduledTask["status"] {
  if (lastCompleted && isSameDay(lastCompleted, now)) return "done";
  if (daysBetween(now, dueDate) < 0) return "overdue";
  return "pending";
}

/**
 * Builds the current set of scheduled tasks for a water body. One entry per
 * template (the next occurrence). Seasonal `close` is omitted — it surfaces as
 * its own checklist when the user ends the season.
 */
export function generateScheduledTasks(
  waterBody: WaterBody,
  completions: TaskCompletion[],
  now: Date = new Date()
): ScheduledTask[] {
  const template = getScheduleTemplate(waterBody.type);
  if (!template) return [];

  const tasks: ScheduledTask[] = [];
  for (const t of template.tasks) {
    if (t.cadence.kind === "seasonal" && t.cadence.phase === "close") continue;

    const lastCompleted = lastCompletionFor(t.key, completions);

    // A completed seasonal "open" drops off the list.
    if (
      t.cadence.kind === "seasonal" &&
      t.cadence.phase === "open" &&
      lastCompleted
    ) {
      continue;
    }

    const due = nextDueDate(lastCompleted, t.cadence, waterBody, now);
    if (!due) continue;

    tasks.push({
      templateKey: t.key,
      waterBodyId: waterBody.id,
      title: t.title,
      category: t.category,
      dueDate: toISODate(due),
      status: statusFor(due, lastCompleted, now),
    });
  }

  // Most urgent first: overdue, then by due date.
  return tasks.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

/** Tasks due on or before `now` (the "Today" list), excluding already-done. */
export function dueTasks(
  waterBody: WaterBody,
  completions: TaskCompletion[],
  now: Date = new Date()
): ScheduledTask[] {
  return generateScheduledTasks(waterBody, completions, now).filter(
    (t) => t.status !== "done" && daysBetween(now, new Date(t.dueDate)) <= 0
  );
}

/** Look up a task template by key (used by notification copy & detail screens). */
export function findTaskTemplate(
  waterBody: WaterBody,
  key: string
): TaskTemplate | undefined {
  return getScheduleTemplate(waterBody.type)?.tasks.find((t) => t.key === key);
}
