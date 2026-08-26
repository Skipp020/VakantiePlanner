import Link from "next/link";
import { logout } from "@/app/actions";

export function Header({
  memberName,
  year,
}: {
  memberName: string;
  year: number;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-brand-dark">VakantiePlanner</h1>
        <p className="text-sm text-brand-grey">
          Ingelogd als <span className="font-medium">{memberName}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-md border border-brand-grey/20 bg-white">
          <Link
            href={`/?year=${year - 1}`}
            className="rounded-l-md px-2 py-1.5 text-sm text-brand-grey hover:bg-brand-grey/10"
            aria-label="Vorig jaar"
          >
            ←
          </Link>
          <span className="px-2 text-sm font-bold text-brand-dark">{year}</span>
          <Link
            href={`/?year=${year + 1}`}
            className="rounded-r-md px-2 py-1.5 text-sm text-brand-grey hover:bg-brand-grey/10"
            aria-label="Volgend jaar"
          >
            →
          </Link>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-md bg-brand-grey/10 px-3 py-2 text-sm font-medium text-brand-grey hover:bg-brand-grey/20"
          >
            Uitloggen
          </button>
        </form>
      </div>
    </div>
  );
}
