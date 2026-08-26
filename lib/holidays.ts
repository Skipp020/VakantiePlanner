export type Holiday = { date: string; name: string };

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toISODate(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function addDays(year: number, month: number, day: number, amount: number) {
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + amount);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function weekday(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = zondag
}

/**
 * Meeus/Jones/Butcher-algoritme voor de datum van eerste Paasdag
 * (Gregoriaanse kalender).
 */
function calculateEaster(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/**
 * Nederlandse feestdagen voor een jaar, als map van ISO-datum -> naam.
 * Koningsdag schuift naar 26 april als 27 april op een zondag valt.
 */
export function getDutchHolidays(year: number): Record<string, string> {
  const easter = calculateEaster(year);
  const goedeVrijdag = addDays(year, easter.month, easter.day, -2);
  const paasMaandag = addDays(year, easter.month, easter.day, 1);
  const hemelvaart = addDays(year, easter.month, easter.day, 39);
  const pinksterMaandag = addDays(year, easter.month, easter.day, 50);

  const koningsdagIsZondag = weekday(year, 4, 27) === 0;
  const koningsdag = koningsdagIsZondag
    ? { year, month: 4, day: 26 }
    : { year, month: 4, day: 27 };

  const holidays: Record<string, string> = {
    [toISODate(year, 1, 1)]: "Nieuwjaarsdag",
    [toISODate(goedeVrijdag.year, goedeVrijdag.month, goedeVrijdag.day)]: "Goede Vrijdag",
    [toISODate(paasMaandag.year, paasMaandag.month, paasMaandag.day)]: "Tweede Paasdag",
    [toISODate(koningsdag.year, koningsdag.month, koningsdag.day)]: "Koningsdag",
    [toISODate(year, 5, 5)]: "Bevrijdingsdag",
    [toISODate(hemelvaart.year, hemelvaart.month, hemelvaart.day)]: "Hemelvaartsdag",
    [toISODate(pinksterMaandag.year, pinksterMaandag.month, pinksterMaandag.day)]:
      "Tweede Pinksterdag",
    [toISODate(year, 12, 25)]: "Eerste Kerstdag",
    [toISODate(year, 12, 26)]: "Tweede Kerstdag",
  };

  return holidays;
}
