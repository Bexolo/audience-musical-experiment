# Hot Tub Hero 🛁

A fun, beginner-friendly mobile app (iOS + Android) that helps casual owners of
**blow-up hot tubs** keep their water healthy all season — and turns the chore
into a gamified routine that tells you exactly what to do today.

> Built with Expo (React Native) + TypeScript, **local-first** (all data on
> device, no account needed). Architected so rigid spas and pools can be added
> later as data, not a rewrite.

## What it does

- **Today / dashboard** — a live **Water Health Score**, your streak & level, and the tasks due now (one tap to mark done).
- **Calendar** — your personalised maintenance plan, generated from your tub's volume, sanitiser and usage.
- **Guide** — what **chemicals** and **tools** you need, with beginner explanations, safety notes, and Amazon affiliate links (a "starter kit" is highlighted).
- **Progress** — streaks, XP/levels and unlockable achievements.
- **Settings** — log a water test and get instant **dosing advice**, plus safety & affiliate disclosures.
- **Notifications** — local reminders when tasks fall due, including a "streak at risk" nudge.

## Architecture

Everything is parameterised by a `WaterBody` so new water-body types are a data
exercise. The rules live in a **pure, fully-tested domain layer** with no React
or native dependencies:

| Module | Responsibility |
|---|---|
| `src/domain/schedule-engine.ts` | Generates due tasks + next-due dates (incl. the usage-based water-change rule). |
| `src/domain/dosing.ts` | Beginner dosing calculator (always conservative, label-disclaimer attached). |
| `src/domain/health-score.ts` | The 0–100 Water Health Score (chemistry 80% / habits 20%). |
| `src/domain/gamification.ts` | Streaks, XP/levels, achievement evaluation. |

Supporting layers: `src/data/*` (bundled catalogues — chemicals, tools, schedule
templates, achievements, targets), `src/db/*` (SQLite + Drizzle, local source of
truth), `src/store/*` (Zustand + derived selectors), `src/notifications/*`
(expo-notifications), `src/affiliate/*` (device-browser link opening), and
`app/*` (Expo Router screens).

### Affiliate links
Affiliate products open in the **device's default browser** via `expo-linking`
(so the installed Amazon app can take over and attribution is preserved) — never
an in-app web view. Replace the placeholder Associates tags in
`src/domain/affiliate.ts` and the placeholder ASINs in `src/data/chemicals.ts` /
`src/data/tools.ts` before launch.

## Develop

```bash
npm install
npm start          # Expo dev server (open in Expo Go / a dev client)
npm test           # run the domain unit tests (36 specs)
npm run typecheck   # tsc --noEmit
```

> Notifications must be tested on a **physical device** — simulators throttle them.

## Status

Phase 1 (blow-up MVP) scaffold: onboarding, schedule engine, Today + Calendar,
task check-off + water log, chemicals/tools guide, local notifications, plus the
Phase 2 gamification core. See the project plan for the full roadmap.

## Disclaimers

General guidance only — not professional advice. Always follow your chemical
product labels, never mix chemicals, and keep them away from children. As an
Amazon Associate the app earns from qualifying purchases.
