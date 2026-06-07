/**
 * Water Health Score — the single 0–100 number on the dashboard.
 *
 * It blends how close the latest water test is to ideal (80%) with how well the
 * user is keeping up with scheduled tasks (20%), so the score rewards both good
 * chemistry and good habits.
 */
import type { TargetRange, WaterTargets, WaterTest } from "./types";

export type HealthBand = "great" | "ok" | "attention";

export interface HealthScore {
  score: number; // 0–100
  band: HealthBand;
  hasTest: boolean;
  components: {
    sanitiser: number;
    ph: number;
    alkalinity: number;
    adherence: number;
  };
}

/**
 * Scores a single reading 0–100:
 *  - 100 inside the ideal band
 *  - tapering 100→70 across the acceptable-but-not-ideal margin
 *  - tapering 70→0 as it goes beyond acceptable (zero at one half-width past)
 */
export function scoreParameter(value: number, range: TargetRange): number {
  const { min, max, idealMin, idealMax } = range;
  if (value >= idealMin && value <= idealMax) return 100;

  if (value >= min && value <= max) {
    // Within acceptable but outside ideal → 70–100.
    if (value < idealMin) {
      const span = idealMin - min || 1;
      return 70 + 30 * ((value - min) / span);
    }
    const span = max - idealMax || 1;
    return 70 + 30 * ((max - value) / span);
  }

  // Beyond acceptable → 0–70, hitting 0 at one acceptable-half-width past.
  const halfWidth = (max - min) / 2 || 1;
  const overshoot = value < min ? min - value : value - max;
  return Math.max(0, 70 * (1 - overshoot / halfWidth));
}

function bandFor(score: number): HealthBand {
  if (score >= 80) return "great";
  if (score >= 55) return "ok";
  return "attention";
}

/**
 * @param latestTest most recent water test, or null if none recorded yet
 * @param targets    target ranges for the water body
 * @param adherence  0–1 share of recently-scheduled tasks completed on time
 */
export function waterHealthScore(
  latestTest: WaterTest | null,
  targets: WaterTargets,
  adherence: number
): HealthScore {
  const clampedAdherence = Math.min(1, Math.max(0, adherence));
  const adherenceScore = clampedAdherence * 100;

  if (!latestTest) {
    // No reading yet — score from habits alone, but cap so an untested tub
    // can't look "great", nudging the user to actually test.
    const score = Math.round(Math.min(60, adherenceScore));
    return {
      score,
      band: bandFor(score),
      hasTest: false,
      components: { sanitiser: 0, ph: 0, alkalinity: 0, adherence: adherenceScore },
    };
  }

  const sanitiser = scoreParameter(latestTest.sanitiserPpm, targets.sanitiser);
  const ph = scoreParameter(latestTest.ph, targets.ph);
  const alkalinity = scoreParameter(latestTest.alkalinityPpm, targets.alkalinity);

  const waterScore = (sanitiser + ph + alkalinity) / 3;
  const score = Math.round(waterScore * 0.8 + adherenceScore * 0.2);

  return {
    score,
    band: bandFor(score),
    hasTest: true,
    components: { sanitiser, ph, alkalinity, adherence: adherenceScore },
  };
}
