"use client";

import { useState, useTransition } from "react";
import { updateMemberSettings, deleteOwnAccount } from "@/app/actions";
import { computeTotalDays, WEEKDAY_OPTIONS } from "@/lib/leaveEntitlement";
import type { MemberRow } from "@/lib/types";

export function AccountSettings({ member }: { member: MemberRow }) {
  const [open, setOpen] = useState(false);
  const [hoursPerWeek, setHoursPerWeek] = useState(member.hours_per_week);
  const [workingDays, setWorkingDays] = useState<number[]>(member.working_days);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleDay(day: number) {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateMemberSettings(hoursPerWeek, workingDays);
      if (result.error) setError(result.error);
      else setSaved(true);
    });
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteOwnAccount();
      if (result.error) {
        setError(result.error);
        setConfirmingDelete(false);
      }
    });
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-sm font-medium text-brand-main hover:underline"
      >
        {open ? "Instellingen sluiten" : "Mijn instellingen"}
      </button>

      {open && (
        <div className="mt-2 max-w-sm rounded-lg border border-brand-grey/20 bg-white p-4">
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-grey">
                Uren per week
              </label>
              <input
                type="number"
                min={1}
                max={40}
                step={0.5}
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-32 rounded-md border border-brand-grey/30 px-3 py-1.5 text-sm text-brand-grey focus:border-brand-main focus:outline-none focus:ring-1 focus:ring-brand-main"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-brand-grey">
                Werkdagen
              </label>
              <div className="flex gap-1">
                {WEEKDAY_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={`w-12 rounded-md py-1.5 text-xs font-medium transition-colors ${
                      workingDays.includes(d.value)
                        ? "bg-brand-main text-white"
                        : "bg-brand-grey/10 text-brand-grey"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-brand-grey">
              Vakantiedagen:{" "}
              <span className="font-bold text-brand-dark">
                {computeTotalDays(hoursPerWeek)}
              </span>{" "}
              per jaar.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-brand-main px-3 py-1.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {isPending ? "Bezig..." : "Opslaan"}
              </button>
              {saved && <span className="text-xs text-brand-main">Opgeslagen.</span>}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>

          <div className="mt-4 border-t border-brand-grey/10 pt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  confirmingDelete
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                {confirmingDelete
                  ? "Weet je het zeker? Klik nogmaals"
                  : "Mijn account verwijderen"}
              </button>
              {confirmingDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="text-sm text-brand-grey hover:underline"
                >
                  Annuleren
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-brand-grey">
              Verwijdert je naam en al je verlofdagen definitief.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
