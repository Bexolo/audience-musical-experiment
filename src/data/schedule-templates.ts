/**
 * Schedule templates keyed by water-body type.
 *
 * v1 only defines `blowup_spa`. Adding a pool later means appending a new
 * template here — the schedule engine reads these generically.
 */
import type { ScheduleTemplate, TaskTemplate } from "@/domain/types";

const BLOWUP_SPA_TASKS: TaskTemplate[] = [
  {
    key: "check_temp_filtration",
    title: "Check temperature & filtration",
    why: "Confirms the heater and pump are doing their job and water is comfortable.",
    category: "inspect",
    cadence: { kind: "daily" },
    preferredTime: "08:00",
  },
  {
    key: "check_dispenser",
    title: "Top up floating dispenser",
    why: "A steady trickle of sanitiser keeps bacteria at bay between tests.",
    category: "sanitise",
    cadence: { kind: "daily" },
    preferredTime: "08:00",
  },
  {
    key: "test_water",
    title: "Test the water",
    why: "Sanitiser and pH drift constantly — testing tells you what to fix before it goes wrong.",
    category: "test",
    cadence: { kind: "everyNDays", n: 2 },
    preferredTime: "17:00",
  },
  {
    key: "shock_water",
    title: "Shock the water",
    why: "A weekly oxidising dose burns off the gunk that normal sanitiser leaves behind.",
    category: "shock",
    cadence: { kind: "weekly" },
    preferredTime: "18:00",
  },
  {
    key: "rinse_filter",
    title: "Rinse the filter",
    why: "A clogged filter can't clean the water — a quick rinse keeps flow strong.",
    category: "filter",
    cadence: { kind: "weekly" },
    preferredTime: "18:00",
  },
  {
    key: "wipe_waterline",
    title: "Wipe the waterline",
    why: "Stops the greasy scum line that builds up and harbours bacteria.",
    category: "clean",
    cadence: { kind: "weekly" },
    preferredTime: "18:00",
  },
  {
    key: "check_alkalinity",
    title: "Check total alkalinity",
    why: "Alkalinity buffers pH — get it right and pH stops bouncing around.",
    category: "balance",
    cadence: { kind: "weekly" },
    preferredTime: "17:00",
  },
  {
    key: "deep_soak_filter",
    title: "Deep-soak the filter cartridge",
    why: "A chemical soak clears the deep grime a rinse can't, extending filter life.",
    category: "filter",
    cadence: { kind: "everyNWeeks", n: 2 },
    preferredTime: "11:00",
  },
  {
    key: "water_change",
    title: "Drain, clean & refill",
    why: "Even perfect chemistry can't fix tired water — a fresh fill resets everything.",
    category: "water_change",
    cadence: { kind: "usageBased" },
    preferredTime: "10:00",
  },
  {
    key: "replace_filter",
    title: "Replace the filter cartridge",
    why: "Cartridges wear out — a fresh one restores proper filtration.",
    category: "filter",
    cadence: { kind: "usageBased" },
    preferredTime: "10:00",
  },
  {
    key: "season_open",
    title: "Open the season",
    why: "A proper start-up checklist gets your tub clean, balanced and safe for first use.",
    category: "season",
    cadence: { kind: "seasonal", phase: "open" },
  },
  {
    key: "season_close",
    title: "Pack away for the season",
    why: "Draining, drying and storing correctly stops mould and protects the liner over winter.",
    category: "season",
    cadence: { kind: "seasonal", phase: "close" },
  },
];

export const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  { type: "blowup_spa", tasks: BLOWUP_SPA_TASKS },
];

export function getScheduleTemplate(
  type: ScheduleTemplate["type"]
): ScheduleTemplate | undefined {
  return SCHEDULE_TEMPLATES.find((t) => t.type === type);
}
