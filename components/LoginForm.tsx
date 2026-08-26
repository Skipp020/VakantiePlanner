"use client";

import { useState, useTransition } from "react";
import { selectMember, createMember } from "@/app/actions";

type MemberOption = { id: string; name: string };

export function LoginForm({ members }: { members: MemberOption[] }) {
  const [mode, setMode] = useState<"pick" | "new">(
    members.length === 0 ? "new" : "pick"
  );
  const [selectedId, setSelectedId] = useState(members[0]?.id ?? "");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePick(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await selectMember(selectedId);
      if (result.error) setError(result.error);
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createMember(newName);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="mx-auto mt-24 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold">Wie ben je?</h1>
      <p className="mt-1 text-sm text-slate-500">
        Geen wachtwoord nodig — kies je naam of voeg jezelf toe.
      </p>

      {members.length > 0 && (
        <div className="mt-4 flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode("pick")}
            className={`rounded-md px-3 py-1 ${
              mode === "pick"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            Bestaande naam
          </button>
          <button
            type="button"
            onClick={() => setMode("new")}
            className={`rounded-md px-3 py-1 ${
              mode === "new"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            Nieuw teamlid
          </button>
        </div>
      )}

      {mode === "pick" && members.length > 0 ? (
        <form onSubmit={handlePick} className="mt-4 space-y-3">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Bezig..." : "Verder als deze naam"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCreate} className="mt-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Jouw naam"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Bezig..." : "Toevoegen en verder"}
          </button>
        </form>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
