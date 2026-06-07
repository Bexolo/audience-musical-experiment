/**
 * Beginner dosing calculator.
 *
 * Deliberately conservative: it computes how much product to add to nudge a
 * reading toward the *ideal midpoint* of its target range, and never tells the
 * user to overshoot. Every result carries a "read the product label" note
 * because real concentrations vary by brand — these strengths are typical
 * defaults, not gospel.
 */
import type { WaterTargets, WaterTest } from "./types";

/** Grams of product to move 1 unit across 1000 L. Typical domestic defaults. */
export const PRODUCT_STRENGTH = {
  /** Raise free chlorine 1 ppm / 1000 L. */
  chlorineUp: 1.5,
  /** Raise bromine 1 ppm / 1000 L. */
  bromineUp: 2.0,
  /** Raise pH 0.1 / 1000 L (so per 1.0 pH unit ≈ 160 g/1000 L). */
  phUp: 16,
  /** Lower pH 0.1 / 1000 L. */
  phDown: 20,
  /** Raise total alkalinity 10 ppm / 1000 L (so per 1 ppm ≈ 1.7 g/1000 L). */
  alkalinityUp: 1.7,
};

export const LABEL_DISCLAIMER =
  "Always follow your product's label — strengths vary by brand. Add chemicals " +
  "gradually with the pump running, then re-test before adding more.";

export type DoseDirection = "raise" | "lower" | "ok";

export interface DoseAdvice {
  parameter: "sanitiser" | "ph" | "alkalinity";
  label: string;
  direction: DoseDirection;
  /** Suggested product to use, or null when no action is needed. */
  product: string | null;
  /** Grams to add (0 when already in the ideal band). */
  grams: number;
  message: string;
}

const round = (n: number) => Math.round(n);

/**
 * Grams needed to change a parameter by `deltaUnits` across `volumeLitres`,
 * given product strength expressed per-unit-per-1000 L. Never negative.
 */
export function gramsToAdjust(
  deltaUnits: number,
  volumeLitres: number,
  gramsPerUnitPer1000L: number
): number {
  if (deltaUnits <= 0 || volumeLitres <= 0) return 0;
  return round(deltaUnits * (volumeLitres / 1000) * gramsPerUnitPer1000L);
}

function midpoint(min: number, max: number): number {
  return (min + max) / 2;
}

/**
 * Full beginner advice for a single test result. Returns one entry per
 * parameter describing whether to raise, lower, or leave it — with a dose.
 */
export function dosingAdvice(
  test: WaterTest,
  targets: WaterTargets,
  volumeLitres: number,
  sanitiserName = "sanitiser"
): DoseAdvice[] {
  const advice: DoseAdvice[] = [];

  // Sanitiser — only ever raised in this beginner flow (you wait for chlorine
  // to fall rather than chemically lowering it).
  {
    const r = targets.sanitiser;
    const target = midpoint(r.idealMin, r.idealMax);
    if (test.sanitiserPpm < r.idealMin) {
      advice.push({
        parameter: "sanitiser",
        label: sanitiserName,
        direction: "raise",
        product: `${sanitiserName} (granules/tablets)`,
        grams: gramsToAdjust(
          target - test.sanitiserPpm,
          volumeLitres,
          PRODUCT_STRENGTH.chlorineUp
        ),
        message: `${sanitiserName} is low — add a dose and re-test.`,
      });
    } else if (test.sanitiserPpm > r.max) {
      advice.push({
        parameter: "sanitiser",
        label: sanitiserName,
        direction: "lower",
        product: null,
        grams: 0,
        message: `${sanitiserName} is high — stop dosing and let it fall before use.`,
      });
    } else {
      advice.push(okAdvice("sanitiser", sanitiserName));
    }
  }

  // pH — can go either way.
  advice.push(
    twoWayAdvice(
      "ph",
      "pH",
      test.ph,
      targets.ph.idealMin,
      targets.ph.idealMax,
      volumeLitres,
      { up: "pH increaser", down: "pH decreaser" },
      { up: PRODUCT_STRENGTH.phUp / 0.1, down: PRODUCT_STRENGTH.phDown / 0.1 }
    )
  );

  // Alkalinity — only raised in the beginner flow (lower it by lowering pH).
  {
    const r = targets.alkalinity;
    const target = midpoint(r.idealMin, r.idealMax);
    if (test.alkalinityPpm < r.idealMin) {
      advice.push({
        parameter: "alkalinity",
        label: "Alkalinity",
        direction: "raise",
        product: "Alkalinity increaser",
        grams: gramsToAdjust(
          target - test.alkalinityPpm,
          volumeLitres,
          PRODUCT_STRENGTH.alkalinityUp
        ),
        message: "Alkalinity is low — raise it first, it stabilises pH.",
      });
    } else if (test.alkalinityPpm > r.max) {
      advice.push({
        parameter: "alkalinity",
        label: "Alkalinity",
        direction: "lower",
        product: "pH decreaser",
        grams: 0,
        message: "Alkalinity is high — bring it down gradually with pH decreaser.",
      });
    } else {
      advice.push(okAdvice("alkalinity", "Alkalinity"));
    }
  }

  return advice;
}

function okAdvice(
  parameter: DoseAdvice["parameter"],
  label: string
): DoseAdvice {
  return {
    parameter,
    label,
    direction: "ok",
    product: null,
    grams: 0,
    message: `${label} is in the ideal range — nothing to do. 👍`,
  };
}

function twoWayAdvice(
  parameter: DoseAdvice["parameter"],
  label: string,
  value: number,
  idealMin: number,
  idealMax: number,
  volumeLitres: number,
  products: { up: string; down: string },
  gramsPerUnit: { up: number; down: number }
): DoseAdvice {
  const target = midpoint(idealMin, idealMax);
  if (value < idealMin) {
    return {
      parameter,
      label,
      direction: "raise",
      product: products.up,
      grams: gramsToAdjust(target - value, volumeLitres, gramsPerUnit.up),
      message: `${label} is low — add ${products.up} and re-test.`,
    };
  }
  if (value > idealMax) {
    return {
      parameter,
      label,
      direction: "lower",
      product: products.down,
      grams: gramsToAdjust(value - target, volumeLitres, gramsPerUnit.down),
      message: `${label} is high — add ${products.down} and re-test.`,
    };
  }
  return okAdvice(parameter, label);
}
