const MONTH_LABELS = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];

export type Workday = {
  iso: string; // YYYY-MM-DD
  day: number; // dag van de maand
  month: number; // 1-12
  weekday: number; // 1=ma .. 5=vr
  isMonday: boolean;
};

export type MonthGroup = {
  month: number;
  label: string;
  days: Workday[];
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/**
 * Alle werkdagen (ma-vr) van een jaar, oplopend, gegroepeerd per maand.
 */
export function getWorkdaysByMonth(year: number): MonthGroup[] {
  const groups: MonthGroup[] = [];

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: Workday[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const weekday = new Date(year, month - 1, day).getDay(); // 0=zo .. 6=za
      if (weekday === 0 || weekday === 6) continue;

      days.push({
        iso: `${year}-${pad(month)}-${pad(day)}`,
        day,
        month,
        weekday,
        isMonday: weekday === 1,
      });
    }

    if (days.length > 0) {
      groups.push({ month, label: MONTH_LABELS[month - 1], days });
    }
  }

  return groups;
}
