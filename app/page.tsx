import { createServiceClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/session";
import { LoginForm } from "@/components/LoginForm";
import { logout } from "@/app/actions";

export default async function HomePage() {
  const member = await getCurrentMember();

  if (!member) {
    let members: { id: string; name: string }[] = [];
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("members")
        .select("id, name")
        .order("name");
      if (error) throw error;
      members = data ?? [];
    } catch {
      return (
        <div className="mx-auto mt-24 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          <p className="font-semibold">Supabase is nog niet geconfigureerd.</p>
          <p className="mt-2">
            Vul <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in (zie{" "}
            <code>.env.example</code>) en draai de migratie in{" "}
            <code>supabase/migrations/0001_init.sql</code>.
          </p>
        </div>
      );
    }

    return <LoginForm members={members} />;
  }

  return (
    <div className="mx-auto mt-24 w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <p className="text-sm text-slate-500">Ingelogd als</p>
      <p className="mt-1 text-lg font-semibold">{member.name}</p>
      <p className="mt-4 text-sm text-slate-500">
        Het verlofrooster (grid) komt in de volgende stap.
      </p>
      <form action={logout} className="mt-6">
        <button
          type="submit"
          className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          Uitloggen
        </button>
      </form>
    </div>
  );
}
