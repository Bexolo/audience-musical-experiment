/**
 * Core domain types for Hot Tub Hero.
 *
 * The whole app is parameterised by `WaterBodyType` so that adding rigid spas
 * and pools later is a data exercise (new schedule templates + catalogue tags)
 * rather than a code rewrite. v1 only *ships* `blowup_spa`, but every layer
 * below — schedule engine, dosing, health score, gamification — is type-agnostic.
 */

export type WaterBodyType =
  | "blowup_spa"
  | "rigid_spa"
  | "inflatable_pool"
  | "above_ground_pool"
  | "inground_pool";

export type SanitiserType = "chlorine" | "bromine";

/** Acceptable + ideal numeric range for a measurable water parameter. */
export interface TargetRange {
  min: number;
  max: number;
  /** Narrower "ideal" band used by the health score for a perfect reading. */
  idealMin: number;
  idealMax: number;
  unit: string;
}

export interface WaterTargets {
  /** Free chlorine OR bromine, depending on the body's sanitiser. */
  sanitiser: TargetRange;
  ph: TargetRange;
  alkalinity: TargetRange;
}

/**
 * A user's water body (their hot tub, in v1). The single source of truth that
 * the schedule engine and everything else reads from.
 */
export interface WaterBody {
  id: string;
  name: string;
  type: WaterBodyType;
  volumeLitres: number;
  sanitiser: SanitiserType;
  /** Typical number of people using it per day — drives usage-based cadence. */
  dailyBathers: number;
  /** Whether the tub is currently set up and in use (gamification only runs in season). */
  inSeason: boolean;
  createdAt: string; // ISO date
}

/** How often a maintenance task recurs. */
export type Cadence =
  | { kind: "daily" }
  | { kind: "everyNDays"; n: number }
  | { kind: "weekly" }
  | { kind: "everyNWeeks"; n: number }
  | { kind: "usageBased" } // computed from volume + bathers (e.g. water change)
  | { kind: "seasonal"; phase: "open" | "close" };

export type TaskCategory =
  | "test"
  | "sanitise"
  | "balance"
  | "shock"
  | "filter"
  | "clean"
  | "water_change"
  | "inspect"
  | "season";

/** A reusable definition of a maintenance task, attached to schedule templates. */
export interface TaskTemplate {
  key: string;
  title: string;
  /** One-line beginner explanation of why this matters. */
  why: string;
  category: TaskCategory;
  cadence: Cadence;
  /** Preferred local time of day to notify, "HH:mm" 24h. */
  preferredTime?: string;
}

/** A schedule template keyed by water-body type. */
export interface ScheduleTemplate {
  type: WaterBodyType;
  tasks: TaskTemplate[];
}

/** A concrete scheduled task instance for a given water body. */
export interface ScheduledTask {
  templateKey: string;
  waterBodyId: string;
  title: string;
  category: TaskCategory;
  /** ISO date the task is next due. */
  dueDate: string;
  status: "pending" | "done" | "overdue";
}

/** A logged completion — the raw event that feeds streaks & achievements. */
export interface TaskCompletion {
  templateKey: string;
  waterBodyId: string;
  completedAt: string; // ISO datetime
}

/** A recorded water test reading. */
export interface WaterTest {
  waterBodyId: string;
  takenAt: string; // ISO datetime
  sanitiserPpm: number;
  ph: number;
  alkalinityPpm: number;
}
