import { getTargets } from "@/data/targets";
import { dosingAdvice, gramsToAdjust, PRODUCT_STRENGTH } from "./dosing";
import type { WaterTest } from "./types";

const targets = getTargets("blowup_spa", "chlorine");

const test = (over: Partial<WaterTest> = {}): WaterTest => ({
  waterBodyId: "tub1",
  takenAt: "2026-06-10T09:00:00.000Z",
  sanitiserPpm: 4,
  ph: 7.4,
  alkalinityPpm: 100,
  ...over,
});

describe("gramsToAdjust", () => {
  it("scales with delta, volume and product strength", () => {
    // raise 2 ppm across 1000 L at 1.5 g/ppm/1000L = 3 g
    expect(gramsToAdjust(2, 1000, PRODUCT_STRENGTH.chlorineUp)).toBe(3);
    // double the volume → double the dose
    expect(gramsToAdjust(2, 2000, PRODUCT_STRENGTH.chlorineUp)).toBe(6);
  });

  it("never returns a negative or non-positive dose", () => {
    expect(gramsToAdjust(-1, 1000, 1.5)).toBe(0);
    expect(gramsToAdjust(2, 0, 1.5)).toBe(0);
  });
});

describe("dosingAdvice", () => {
  it("reports all-clear when every reading is ideal", () => {
    const advice = dosingAdvice(test(), targets, 900);
    expect(advice.every((a) => a.direction === "ok")).toBe(true);
    expect(advice.every((a) => a.grams === 0)).toBe(true);
  });

  it("recommends raising low sanitiser with a positive dose", () => {
    const advice = dosingAdvice(test({ sanitiserPpm: 1 }), targets, 900);
    const san = advice.find((a) => a.parameter === "sanitiser")!;
    expect(san.direction).toBe("raise");
    expect(san.grams).toBeGreaterThan(0);
  });

  it("tells the user to wait (no dose) when sanitiser is too high", () => {
    const advice = dosingAdvice(test({ sanitiserPpm: 12 }), targets, 900);
    const san = advice.find((a) => a.parameter === "sanitiser")!;
    expect(san.direction).toBe("lower");
    expect(san.grams).toBe(0);
    expect(san.product).toBeNull();
  });

  it("lowers high pH with pH decreaser", () => {
    const advice = dosingAdvice(test({ ph: 8.0 }), targets, 900);
    const ph = advice.find((a) => a.parameter === "ph")!;
    expect(ph.direction).toBe("lower");
    expect(ph.product).toBe("pH decreaser");
    expect(ph.grams).toBeGreaterThan(0);
  });

  it("raises low alkalinity", () => {
    const advice = dosingAdvice(test({ alkalinityPpm: 60 }), targets, 900);
    const alk = advice.find((a) => a.parameter === "alkalinity")!;
    expect(alk.direction).toBe("raise");
    expect(alk.grams).toBeGreaterThan(0);
  });
});
