import { getTargets } from "@/data/targets";
import { scoreParameter, waterHealthScore } from "./health-score";
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

describe("scoreParameter", () => {
  it("scores 100 inside the ideal band", () => {
    expect(scoreParameter(7.4, targets.ph)).toBe(100);
  });

  it("scores lower the further outside acceptable", () => {
    const slightlyOff = scoreParameter(6.9, targets.ph); // just below min 7.0
    const wayOff = scoreParameter(6.0, targets.ph);
    expect(slightlyOff).toBeLessThan(100);
    expect(wayOff).toBeLessThan(slightlyOff);
    expect(wayOff).toBeGreaterThanOrEqual(0);
  });

  it("never goes below zero", () => {
    expect(scoreParameter(0, targets.ph)).toBe(0);
  });
});

describe("waterHealthScore", () => {
  it("scores a perfect tub highly", () => {
    const h = waterHealthScore(test(), targets, 1);
    expect(h.score).toBe(100);
    expect(h.band).toBe("great");
    expect(h.hasTest).toBe(true);
  });

  it("caps an untested tub below 'great' to nudge testing", () => {
    const h = waterHealthScore(null, targets, 1);
    expect(h.hasTest).toBe(false);
    expect(h.score).toBeLessThanOrEqual(60);
  });

  it("drops into 'attention' when chemistry is badly off", () => {
    const h = waterHealthScore(
      test({ sanitiserPpm: 0, ph: 8.6, alkalinityPpm: 20 }),
      targets,
      0.2
    );
    expect(h.band).toBe("attention");
    expect(h.score).toBeLessThan(55);
  });

  it("weights chemistry above adherence", () => {
    const goodWaterLazyUser = waterHealthScore(test(), targets, 0);
    const badWaterKeenUser = waterHealthScore(
      test({ sanitiserPpm: 0, ph: 9, alkalinityPpm: 10 }),
      targets,
      1
    );
    expect(goodWaterLazyUser.score).toBeGreaterThan(badWaterKeenUser.score);
  });
});
