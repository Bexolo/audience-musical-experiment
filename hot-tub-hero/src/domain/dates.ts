/** Small, dependency-free date helpers used across the domain layer. */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Midnight (local) of the given date. */
export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Whole calendar days from `a` to `b` (b - a), ignoring time of day. */
export function daysBetween(a: Date, b: Date): number {
  return Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_PER_DAY
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return daysBetween(a, b) === 0;
}

export function toISODate(d: Date): string {
  return startOfDay(d).toISOString();
}
