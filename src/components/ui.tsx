import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { toneFor, type Tone } from '../lib/constants'
import { initials } from '../lib/format'

const TONE_CLASSES: Record<Tone, string> = {
  green: 'bg-success-50 text-success-700 ring-success-600/20',
  yellow: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  orange: 'bg-warning-50 text-warning-700 ring-warning-600/25',
  red: 'bg-danger-50 text-danger-700 ring-danger-600/20',
  blue: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  teal: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  navy: 'bg-slate-100 text-navy ring-slate-500/20',
  gray: 'bg-slate-50 text-slate-500 ring-slate-400/20',
}

const DOT_CLASSES: Record<Tone, string> = {
  green: 'bg-success', yellow: 'bg-amber-400', orange: 'bg-warning', red: 'bg-danger',
  blue: 'bg-brand', teal: 'bg-teal-600', navy: 'bg-navy', gray: 'bg-slate-400',
}

export function Badge({ value, label, tone }: { value: unknown; label?: string; tone?: Tone }) {
  if (value === null || value === undefined || value === '') return <span className="text-slate-300">—</span>
  const t = tone ?? toneFor(value)
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[t]}`}>
      <span className={`size-1.5 rounded-full ${DOT_CLASSES[t]}`} />
      {label ?? String(value)}
    </span>
  )
}

export function Card({ title, subtitle, action, children, className = '' }: {
  title?: ReactNode; subtitle?: ReactNode; action?: ReactNode; children: ReactNode; className?: string
}) {
  return (
    <section className={`rounded-2xl border border-slate-200/80 bg-white shadow-xs ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-navy">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className="p-5 pt-3">{children}</div>
    </section>
  )
}

export function PageHeader({ title, subtitle, icon, actions }: {
  title: string; subtitle?: string; icon?: ReactNode; actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && <div className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">{icon}</div>}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-navy sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon, hint, tone = 'navy' }: {
  label: string; value: ReactNode; icon: ReactNode; hint?: ReactNode; tone?: Tone
}) {
  const iconTone: Record<Tone, string> = {
    green: 'bg-success-50 text-success-700', yellow: 'bg-amber-50 text-amber-700', orange: 'bg-warning-50 text-warning-700',
    red: 'bg-danger-50 text-danger-700', blue: 'bg-brand-50 text-brand-700', teal: 'bg-teal-50 text-teal-700',
    navy: 'bg-slate-100 text-navy', gray: 'bg-slate-100 text-slate-500',
  }
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className={`grid size-8 place-items-center rounded-lg ${iconTone[tone]}`}>{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-navy tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function Progress({ value, tone }: { value: number; tone?: Tone }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  const t = tone ?? (v >= 100 ? 'green' : v >= 50 ? 'blue' : v >= 25 ? 'yellow' : 'orange')
  return (
    <div className="flex min-w-28 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${DOT_CLASSES[t]}`} style={{ width: `${v}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-medium text-slate-600 tabular-nums">{Math.round(v)}%</span>
    </div>
  )
}

const AVATAR_COLORS = ['bg-brand', 'bg-teal-600', 'bg-navy', 'bg-indigo-600', 'bg-sky-700', 'bg-slate-600']

export function Avatar({ id, name, size = 'sm' }: { id: string; name: string; size?: 'sm' | 'md' }) {
  const n = Number(id.replace(/\D/g, '')) || 0
  const s = size === 'sm' ? 'size-6 text-[10px]' : 'size-8 text-xs'
  return (
    <span title={`${name} (${id})`} className={`inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ring-2 ring-white ${s} ${AVATAR_COLORS[n % AVATAR_COLORS.length]}`}>
      {initials(name)}
    </span>
  )
}

export function Modal({ open, onClose, title, children, footer, size = 'lg' }: {
  open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; size?: 'md' | 'lg' | 'xl'
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  const w = { md: 'max-w-lg', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size]
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={onClose}>
      <div className={`flex max-h-[92vh] w-full ${w} flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-navy">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

export const btn = {
  primary: 'inline-flex items-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-brand-700 disabled:opacity-50',
  secondary: 'inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50',
  danger: 'inline-flex items-center gap-2 rounded-lg bg-danger px-3.5 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:opacity-50',
  ghost: 'inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100',
}

export const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-navy placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/15 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500'

export function Spinner() {
  return <div className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand" />
}

export function EmptyState({ text }: { text: string }) {
  return <div className="py-12 text-center text-sm text-slate-400">{text}</div>
}

/** The Digimonde "D" mark on a white tile, so every colour of the logo reads on dark backgrounds too. */
export function BrandMark({ className = 'size-9' }: { className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl bg-white p-1 shadow-sm ${className}`}>
      <img src="/logo-mark.png" alt="Digimonde" className="size-full object-contain" />
    </span>
  )
}

/** DIGI (light, blue) + MONDE (bold, orange), matching the logo. Use `onDark` on navy backgrounds. */
export function Wordmark({ onDark = false, className = 'text-[15px]' }: { onDark?: boolean; className?: string }) {
  return (
    <span className={`leading-none tracking-tight ${className}`}>
      <span className={`font-normal ${onDark ? 'text-[#4BA3F0]' : 'text-[#1873C2]'}`}>DIGI</span>
      <span className="font-extrabold text-[#F28322]">MONDE</span>
    </span>
  )
}
