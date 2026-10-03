import { useEffect, useState, type ReactNode } from 'react'
import { Calculator, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLookups } from '../context/LookupsContext'
import type { Column, Row } from '../lib/types'
import { EmployeeMultiSelect, RefSelect } from './Fields'
import { Modal, btn, inputCls } from './ui'
import { renderCell } from './DataTable'

interface Props {
  open: boolean
  row: Row | null
  columns: Column[]
  writeTable: string
  entity: string
  readOnly: boolean
  defaults?: Row
  extra?: (row: Row | null) => ReactNode
  onClose: () => void
  onSaved: () => void
}

const NUMERIC = new Set(['number', 'currency', 'percent'])

export function RecordForm({ open, row, columns, writeTable, entity, readOnly, defaults, extra, onClose, onSaved }: Props) {
  const lk = useLookups()
  const editable = columns.filter((c) => !c.computed && !c.hideInForm)
  const computed = columns.filter((c) => c.computed && c.key !== 'id')
  const [form, setForm] = useState<Row>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const init: Row = {}
    for (const c of editable) {
      const v = row ? row[c.key] : defaults?.[c.key]
      init[c.key] = c.type === 'employees' || c.type === 'tags' ? (v ?? []) : (v ?? '')
    }
    setForm(init)
    setError(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, row])

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    const payload: Row = {}
    for (const c of editable) {
      let v = form[c.key]
      const shown = !c.showIf || c.showIf(form)
      if (shown && c.required && (v === '' || v === null || (Array.isArray(v) && !v.length))) {
        setError(`${c.label} is required.`)
        return
      }
      if (v === '') v = null
      else if (NUMERIC.has(c.type ?? '') && v !== null) v = Number(v)
      payload[c.key] = v
    }
    setSaving(true)
    const res = row
      ? await supabase.from(writeTable).update(payload).eq('id', row.id)
      : await supabase.from(writeTable).insert(payload)
    setSaving(false)
    if (res.error) {
      setError(res.error.code === '42501' ? 'You do not have permission to change this record.' : res.error.message)
      return
    }
    onSaved()
  }

  const field = (c: Column) => {
    const v = form[c.key]
    const disabled = readOnly
    switch (c.type) {
      case 'textarea':
        return <textarea rows={3} disabled={disabled} value={v ?? ''} onChange={(e) => set(c.key, e.target.value)} className={inputCls} />
      case 'select':
        return (
          <select disabled={disabled} value={v ?? ''} onChange={(e) => set(c.key, e.target.value)} className={inputCls}>
            {!c.required && <option value="">—</option>}
            {c.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )
      case 'employee':
        return <RefSelect disabled={disabled} value={v || null} onChange={(x) => set(c.key, x ?? '')} placeholder="Select employee…"
          options={lk.employees.map((e) => ({ value: e.id, label: e.name, hint: e.role_title ?? undefined }))} />
      case 'employees':
        return <EmployeeMultiSelect disabled={disabled} value={v ?? []} onChange={(x) => set(c.key, x)} />
      case 'project':
        return <RefSelect disabled={disabled} value={v || null} onChange={(x) => set(c.key, x ?? '')} placeholder="Select project…"
          options={lk.projects.map((p) => ({ value: p.id, label: p.name }))} />
      case 'anyproject':
        return <RefSelect disabled={disabled} value={v || null} onChange={(x) => set(c.key, x ?? '')} placeholder="Select Dev or DM project…"
          options={[
            ...lk.projects.map((p) => ({ value: p.id, label: p.name, hint: 'Dev' })),
            ...lk.dmProjects.map((p) => ({ value: p.id, label: p.name, hint: 'DM' })),
          ]} />
      case 'client':
        return <RefSelect disabled={disabled} value={v || null} onChange={(x) => set(c.key, x ?? '')} placeholder="Select client…"
          options={lk.clients.map((p) => ({ value: p.id, label: p.company_name }))} />
      case 'date':
        return <input type="date" disabled={disabled} value={v ?? ''} onChange={(e) => set(c.key, e.target.value)} className={inputCls} />
      case 'number':
      case 'currency':
      case 'percent':
        return <input type="number" disabled={disabled} value={v ?? ''} min={c.min} max={c.max} step={c.step ?? (c.type === 'currency' ? 0.01 : 1)}
          onChange={(e) => set(c.key, e.target.value)} className={`${inputCls} tabular-nums`} />
      default:
        return <input type={c.type === 'email' ? 'email' : 'text'} disabled={disabled} value={v ?? ''} onChange={(e) => set(c.key, e.target.value)} className={inputCls} />
    }
  }

  const title = row ? `${readOnly ? '' : 'Edit '}${entity} · ${row.id}` : `New ${entity}`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        readOnly ? (
          <button className={btn.secondary} onClick={onClose}>Close</button>
        ) : (
          <>
            <button className={btn.secondary} onClick={onClose}>Cancel</button>
            <button className={btn.primary} onClick={save} disabled={saving}>
              <Save size={15} /> {saving ? 'Saving…' : row ? 'Save changes' : `Create ${entity}`}
            </button>
          </>
        )
      }
    >
      {error && <div className="mb-4 rounded-lg bg-danger-50 p-3 text-sm text-danger-700">{error}</div>}

      {row && computed.length > 0 && (
        <div className="mb-5 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-brand-700 uppercase">
            <Calculator size={13} /> Calculated automatically
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {computed.map((c) => (
              <div key={c.key} className="min-w-0">
                <dt className="text-[11px] text-slate-500">{c.label}</dt>
                <dd className="mt-0.5 text-sm text-navy">{renderCell(c, row, lk)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        {editable.filter((c) => !c.showIf || c.showIf(form)).map((c) => (
          <div key={c.key} className={`block ${c.wide || c.type === 'textarea' || c.type === 'employees' ? 'sm:col-span-2' : ''}`}>
            <span className="mb-1 block text-xs font-medium text-slate-600">
              {c.label} {c.required && !readOnly && <span className="text-danger">*</span>}
            </span>
            {field(c)}
            {c.help && <span className="mt-1 block text-[11px] text-slate-400">{c.help}</span>}
          </div>
        ))}
      </div>

      {extra?.(row)}
    </Modal>
  )
}
