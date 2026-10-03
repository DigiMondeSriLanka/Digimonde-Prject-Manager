import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { useLookups } from '../context/LookupsContext'
import { Avatar, inputCls } from './ui'

export interface Option { value: string; label: string; hint?: string }

/** Searchable single select — used for Employee / Project / Client IDs. */
export function RefSelect({ value, onChange, options, placeholder, disabled }: {
  value: string | null; onChange: (v: string | null) => void; options: Option[]; placeholder?: string; disabled?: boolean
}) {
  return (
    <Dropdown
      disabled={disabled}
      options={options}
      selected={value ? [value] : []}
      onToggle={(v) => onChange(v === value ? null : v)}
      closeOnPick
      placeholder={placeholder}
      renderValue={() => {
        const o = options.find((x) => x.value === value)
        return o ? <span className="truncate">{o.label} <span className="text-slate-400">· {o.value}</span></span> : null
      }}
      onClear={value ? () => onChange(null) : undefined}
    />
  )
}

/** Multi-person picker (Assigned To, Participants). */
export function EmployeeMultiSelect({ value, onChange, disabled }: {
  value: string[]; onChange: (v: string[]) => void; disabled?: boolean
}) {
  const { employees, employeeName } = useLookups()
  const options = useMemo(() => employees.map((e) => ({ value: e.id, label: e.name, hint: e.role_title ?? undefined })), [employees])
  return (
    <Dropdown
      disabled={disabled}
      options={options}
      selected={value}
      onToggle={(v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])}
      placeholder="Select people…"
      renderValue={() =>
        value.length ? (
          <span className="flex flex-wrap gap-1">
            {value.map((id) => (
              <span key={id} className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-0.5 pr-2 pl-0.5 text-xs text-navy">
                <Avatar id={id} name={employeeName(id)} />
                {employeeName(id)}
                {!disabled && (
                  <X size={12} className="cursor-pointer text-slate-400 hover:text-danger"
                    onMouseDown={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== id)) }} />
                )}
              </span>
            ))}
          </span>
        ) : null
      }
    />
  )
}

function Dropdown({ options, selected, onToggle, placeholder, renderValue, closeOnPick, onClear, disabled }: {
  options: Option[]; selected: string[]; onToggle: (v: string) => void; placeholder?: string
  renderValue: () => React.ReactNode; closeOnPick?: boolean; onClear?: () => void; disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const filtered = options.filter((o) => `${o.label} ${o.value} ${o.hint ?? ''}`.toLowerCase().includes(q.toLowerCase()))
  const shown = renderValue()

  return (
    <div ref={ref} className="relative" onKeyDown={(e) => { if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false) } }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`${inputCls} flex min-h-[38px] items-center justify-between gap-2 text-left`}
      >
        <span className="min-w-0 flex-1">{shown ?? <span className="text-slate-400">{placeholder ?? 'Select…'}</span>}</span>
        {onClear && !disabled ? (
          <X size={14} className="shrink-0 text-slate-400 hover:text-danger" onMouseDown={(e) => { e.stopPropagation(); onClear() }} />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full min-w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <div className="relative mb-1">
            <Search size={14} className="absolute top-2.5 left-2.5 text-slate-400" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className={`${inputCls} pl-8`} />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {filtered.map((o) => {
              const on = selected.includes(o.value)
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => { onToggle(o.value); if (closeOnPick) { setOpen(false); setQ('') } }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50 ${on ? 'bg-brand-50/60' : ''}`}
                  >
                    <span className={`grid size-4 shrink-0 place-items-center rounded border ${on ? 'border-brand bg-brand text-white' : 'border-slate-300'}`}>
                      {on && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-navy">{o.label}</span>
                    <span className="shrink-0 text-xs text-slate-400">{o.hint ? `${o.hint} · ` : ''}{o.value}</span>
                  </button>
                </li>
              )
            })}
            {!filtered.length && <li className="px-2 py-3 text-center text-xs text-slate-400">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
