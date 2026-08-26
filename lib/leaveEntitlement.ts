export const FULL_TIME_HOURS_PER_WEEK = 40;
export const FULL_TIME_DAYS_PER_YEAR = 35;

export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Ma" },
  { value: 2, label: "Di" },
  { value: 3, label: "Wo" },
  { value: 4, label: "Do" },
  { value: 5, label: "Vr" },
] as const;

/**
 * Vakantiedagen naar rato van het aantal contracturen: 35 dagen bij een
 * fulltime werkweek van 40 uur, afgerond op halve dagen.
 */
export function computeTotalDays(hoursPerWeek: number): number {
  const raw = (FULL_TIME_DAYS_PER_YEAR * hoursPerWeek) / FULL_TIME_HOURS_PER_WEEK;
  return Math.round(raw * 2) / 2;
}
