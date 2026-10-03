import { useState, type FormEvent } from 'react'
import { BarChart3, CheckCircle2, ShieldCheck, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { btn, inputCls } from '../components/ui'

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg({ ok: false, text: error.message })
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin } })
      if (error) setMsg({ ok: false, text: error.message })
      else if (!data.session) setMsg({ ok: true, text: 'Account created. Check your inbox to confirm your email, then sign in.' })
    }
    setBusy(false)
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="size-10 rounded-xl ring-1 ring-white/10" />
          <span className="text-lg font-bold">Digimonde</span>
        </div>
        <div>
          <h1 className="max-w-md text-4xl leading-tight font-bold tracking-tight">Every project, task and deadline in one place.</h1>
          <p className="mt-4 max-w-md text-slate-400">Plan, track and report delivery across Web, Software, Media and Digital Marketing, with live executive dashboards.</p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {[
              [BarChart3, 'Live executive dashboard & project health'],
              [Users, 'Team workload and resource planning'],
              [ShieldCheck, 'Role-based access for admins and employees'],
            ].map(([Icon, t], i) => {
              const I = Icon as typeof BarChart3
              return <li key={i} className="flex items-center gap-3"><I size={18} className="text-brand" />{t as string}</li>
            })}
          </ul>
        </div>
        <p className="text-xs text-slate-500">© {new Date().getFullYear()} Digimonde</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/favicon.svg" alt="" className="size-9 rounded-xl" />
            <span className="text-lg font-bold text-navy">Digimonde</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-navy">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            {mode === 'signin' ? 'Sign in to your workspace.' : 'New accounts get employee (view-only) access. The first account becomes admin.'}
          </p>

          {msg && (
            <div className={`mb-4 flex gap-2 rounded-lg p-3 text-sm ${msg.ok ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
              {msg.ok && <CheckCircle2 size={16} className="mt-0.5 shrink-0" />} {msg.text}
            </div>
          )}

          <div className="space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">Full name</span>
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
              </label>
            )}
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Work email</span>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Password</span>
              <input type="password" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
            </label>
            <button disabled={busy} className={`${btn.primary} w-full justify-center py-2.5`}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" className="font-semibold text-brand hover:underline" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(null) }}>
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
