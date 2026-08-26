export function ConfigWarning() {
  return (
    <div className="mx-auto mt-24 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
      <p className="font-semibold">Supabase is nog niet geconfigureerd.</p>
      <p className="mt-2">
        Vul <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code> in (zie <code>.env.example</code>)
        en draai de migratie in <code>supabase/migrations/0001_init.sql</code>.
      </p>
    </div>
  );
}
