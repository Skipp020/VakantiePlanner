"use client";

import { useMemo, useState, useTransition } from "react";
import { toggleLeaveDay } from "@/app/actions";
import { getDutchHolidays } from "@/lib/holidays";
import { getWorkdaysByMonth } from "@/lib/workdays";
import { leaveKey, type LeaveMap, type LeaveStatus, type MemberRow } from "@/lib/types";

const NAME_COL = 160;
const STAT_COL = 56;
const DAY_COL = 24;
const STAT_LEFT = [NAME_COL, NAME_COL + STAT_COL, NAME_COL + 2 * STAT_COL];
const STICKY_WIDTH = NAME_COL + 3 * STAT_COL;

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const BRAND_MAIN = "#195AA6";
const BRAND_MID = "#0B78BE";
const BRAND_GREY = "#575756";

export function PlannerGrid({
  year,
  members,
  initialLeave,
  currentMemberId,
}: {
  year: number;
  members: MemberRow[];
  initialLeave: LeaveMap;
  currentMemberId: string;
}) {
  const [leave, setLeave] = useState<LeaveMap>(initialLeave);
  const [, startTransition] = useTransition();

  const months = useMemo(() => getWorkdaysByMonth(year), [year]);
  const holidays = useMemo(() => getDutchHolidays(year), [year]);
  const allDays = useMemo(() => months.flatMap((m) => m.days), [months]);

  const heatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const day of allDays) {
      let count = 0;
      for (const member of members) {
        if (leave[leaveKey(member.id, day.iso)]) count++;
      }
      counts[day.iso] = count;
    }
    return counts;
  }, [allDays, members, leave]);

  function handleCellClick(memberId: string, dateISO: string) {
    if (memberId !== currentMemberId) return;
    if (holidays[dateISO]) return;

    const key = leaveKey(memberId, dateISO);
    const current = leave[key];
    const next: LeaveStatus | undefined =
      current === undefined ? 1 : current === 1 ? 2 : undefined;

    setLeave((prev) => {
      const copy = { ...prev };
      if (next === undefined) delete copy[key];
      else copy[key] = next;
      return copy;
    });

    startTransition(async () => {
      const result = await toggleLeaveDay(dateISO);
      if (result.error) {
        setLeave((prev) => {
          const copy = { ...prev };
          if (current === undefined) delete copy[key];
          else copy[key] = current;
          return copy;
        });
      }
    });
  }

  function cellStyle(status: LeaveStatus | undefined, holidayName: string | undefined) {
    if (holidayName) return { backgroundColor: hexToRgba(BRAND_GREY, 0.18) };
    if (status === 2) return { backgroundColor: BRAND_MAIN };
    if (status === 1) return { backgroundColor: hexToRgba(BRAND_MID, 0.45) };
    return undefined;
  }

  return (
    <div>
      <Legend />
      <div className="overflow-x-auto rounded-lg border border-brand-grey/20">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th
                colSpan={4}
                className="sticky left-0 top-0 z-30 h-7 border-b border-brand-grey/20 bg-white"
                style={{ width: STICKY_WIDTH, minWidth: STICKY_WIDTH }}
              />
              {months.map((m) => (
                <th
                  key={m.month}
                  colSpan={m.days.length}
                  className="sticky top-0 z-10 h-7 border-b border-l border-brand-grey/20 bg-white px-1 text-left font-bold capitalize text-brand-dark"
                >
                  {m.label}
                </th>
              ))}
            </tr>
            <tr>
              <th
                colSpan={4}
                className="sticky left-0 top-7 z-30 h-6 border-b border-brand-grey/20 bg-white px-2 text-left font-bold text-brand-dark"
                style={{ width: STICKY_WIDTH, minWidth: STICKY_WIDTH }}
              >
                Team
              </th>
              {allDays.map((d) => {
                const holidayName = holidays[d.iso];
                return (
                  <th
                    key={d.iso}
                    title={holidayName ? `${d.iso} — ${holidayName}` : d.iso}
                    className={`sticky top-7 z-10 h-6 border-b border-brand-grey/20 bg-white text-center font-normal text-brand-grey ${
                      d.isMonday ? "border-l" : ""
                    }`}
                    style={{ width: DAY_COL, minWidth: DAY_COL }}
                  >
                    {d.day}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="sticky left-0 z-20 border-b border-brand-grey/20 bg-white px-2 py-1 font-bold text-brand-dark"
                style={{ width: STICKY_WIDTH, minWidth: STICKY_WIDTH }}
              >
                Tegelijk weg
              </td>
              {allDays.map((d) => {
                const count = heatCounts[d.iso];
                const ratio = members.length > 0 ? count / members.length : 0;
                const alpha = count > 0 ? 0.15 + 0.65 * ratio : 0;
                return (
                  <td
                    key={d.iso}
                    title={`${count} van ${members.length} weg op ${d.iso}`}
                    className={`h-6 border-b border-brand-grey/20 ${
                      d.isMonday ? "border-l" : ""
                    }`}
                    style={{
                      width: DAY_COL,
                      minWidth: DAY_COL,
                      backgroundColor: hexToRgba(BRAND_MAIN, alpha),
                    }}
                  />
                );
              })}
            </tr>

            {members.map((member) => {
              const isOwnRow = member.id === currentMemberId;
              const confirmedCount = allDays.filter(
                (d) => leave[leaveKey(member.id, d.iso)] === 2
              ).length;
              const remaining = member.total_days - confirmedCount;

              return (
                <tr key={member.id} className={isOwnRow ? "bg-brand-bright/5" : undefined}>
                  <td
                    className="sticky left-0 z-20 truncate border-b border-brand-grey/10 bg-inherit px-2 py-1 text-brand-grey"
                    style={{ width: NAME_COL, minWidth: NAME_COL }}
                    title={member.name}
                  >
                    {member.name}
                    {isOwnRow && <span className="text-brand-main"> (jij)</span>}
                  </td>
                  <td
                    className="sticky z-20 border-b border-brand-grey/10 bg-inherit px-2 py-1 text-center text-brand-grey"
                    style={{ left: STAT_LEFT[0], width: STAT_COL, minWidth: STAT_COL }}
                  >
                    {member.total_days}
                  </td>
                  <td
                    className="sticky z-20 border-b border-brand-grey/10 bg-inherit px-2 py-1 text-center text-brand-grey"
                    style={{ left: STAT_LEFT[1], width: STAT_COL, minWidth: STAT_COL }}
                  >
                    {confirmedCount}
                  </td>
                  <td
                    className={`sticky z-20 border-b border-brand-grey/10 bg-inherit px-2 py-1 text-center font-medium ${
                      remaining < 0 ? "text-red-600" : "text-brand-dark"
                    }`}
                    style={{ left: STAT_LEFT[2], width: STAT_COL, minWidth: STAT_COL }}
                  >
                    {remaining}
                  </td>

                  {allDays.map((d) => {
                    const status = leave[leaveKey(member.id, d.iso)];
                    const holidayName = holidays[d.iso];
                    const editable = isOwnRow && !holidayName;

                    return (
                      <td
                        key={d.iso}
                        onClick={editable ? () => handleCellClick(member.id, d.iso) : undefined}
                        title={
                          holidayName ??
                          (status === 2 ? "Bevestigd" : status === 1 ? "Optie" : undefined)
                        }
                        className={`h-6 border-b border-brand-grey/10 ${
                          d.isMonday ? "border-l" : ""
                        } ${editable ? "cursor-pointer hover:opacity-70" : ""}`}
                        style={{
                          width: DAY_COL,
                          minWidth: DAY_COL,
                          ...cellStyle(status, holidayName),
                        }}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-brand-grey">
      <LegendItem color={hexToRgba(BRAND_MID, 0.45)} label="Optie" />
      <LegendItem color={BRAND_MAIN} label="Bevestigd" />
      <LegendItem color={hexToRgba(BRAND_GREY, 0.18)} label="Feestdag" />
      <span className="text-brand-main">■ Jouw rij is bewerkbaar — klik op een dag</span>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-sm border border-brand-grey/20"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
