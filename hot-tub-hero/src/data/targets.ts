/**
 * Beginner-safe target water ranges.
 *
 * These are sound defaults for a domestic blow-up spa. They MUST be reviewed
 * against reputable sources (and ideally the user's chemical brand) before
 * launch — see the plan's "Content sourcing" checklist item.
 */
import type { SanitiserType, WaterBodyType, WaterTargets } from "@/domain/types";

const PH = { min: 7.0, max: 7.8, idealMin: 7.2, idealMax: 7.6, unit: "" };
const ALKALINITY = { min: 80, max: 120, idealMin: 90, idealMax: 110, unit: "ppm" };

const CHLORINE = { min: 3, max: 5, idealMin: 3, idealMax: 5, unit: "ppm" };
const BROMINE = { min: 4, max: 6, idealMin: 4, idealMax: 6, unit: "ppm" };

/**
 * Returns the target ranges for a water body. Currently spa-tuned; pool types
 * will plug in their own bands here when they ship (e.g. lower sanitiser).
 */
export function getTargets(
  _type: WaterBodyType,
  sanitiser: SanitiserType
): WaterTargets {
  return {
    sanitiser: sanitiser === "bromine" ? BROMINE : CHLORINE,
    ph: PH,
    alkalinity: ALKALINITY,
  };
}
