/**
 * Jest config scoped to the pure domain layer (src/domain).
 *
 * These modules contain no React Native / native dependencies, so they run
 * under plain ts-jest in a node environment. This keeps the rules engine
 * (schedule, dosing, health score, gamification) fast and verifiable in CI
 * without needing the full Expo/RN test harness.
 */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src/domain"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.jest.json" },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
