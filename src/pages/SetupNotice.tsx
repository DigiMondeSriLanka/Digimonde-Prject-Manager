export default function SetupNotice() {
  return (
    <div className="grid min-h-full place-items-center p-6">
      <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-navy">Connect Supabase</h1>
        <p className="mt-2 text-sm text-slate-600">
          Copy <code className="rounded bg-slate-100 px-1">.env.example</code> to <code className="rounded bg-slate-100 px-1">.env</code> and set
          <code className="mx-1 rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code> and
          <code className="mx-1 rounded bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
        </p>
        <p className="mt-3 text-sm text-slate-600">See <b>README.md</b> for the full database setup (schema + sample data).</p>
      </div>
    </div>
  )
}
