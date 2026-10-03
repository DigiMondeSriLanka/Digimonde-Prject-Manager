import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLookups } from '../context/LookupsContext'
import type { Column, Row } from '../lib/types'
import { downloadCSV, fmtDate, fmtMoney } from '../lib/format'
import { Avatar, Badge, EmptyState, Progress, Spinner, btn, inputCls } from './ui'
import { RecordForm } from './RecordForm'

type Lookups = ReturnType<typeof useLookups>

export function displayText(col: Column, row: Row, lk: Lookups): string {
  const v = row[col.key]
  if (v === null || v === undefined) return ''
  switch (col.type) {
    case 'employee': return lk.employeeName(v)
    case 'employees': return (v as string[]).map(lk.employeeName).join('; ')
    case 'project':
    case 'anyproject': return `${v} — ${lk.projectName(v)}`
    case 'client': return lk.clientName(v)
    case 'tags': return Array.isArray(v) ? v.join('; ') : String(v)
    default: return Array.isArray(v) ? v.join('; ') : String(v)
  }
}

export function renderCell(col: Column, row: Row, lk: Lookups): ReactNode {
  if (col.render) return col.render(row)
  const v = row[col.key]
  if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) {
    return col.type === 'percent' ? <Progress value={0} /> : <span className="text-slate-300">—</span>
  }
  switch (col.type) {
    case 'select': return <Badge value={v} />
    case 'employee':
      return (
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Avatar id={v} name={lk.employeeName(v)} />
          {lk.employeeName(v)}
        </span>
      )
    case 'employees': {
      const ids = v as string[]
      return (
        <span className="flex items-center gap-2" title={ids.map(lk.employeeName).join(', ')}>
          <span className="flex -space-x-1.5">
            {ids.slice(0, 4).map((id) => <Avatar key={id} id={id} name={lk.employeeName(id)} />)}
          </span>
          <span className="truncate whitespace-nowrap text-slate-600">
            {ids.length === 1 ? lk.employeeName(ids[0]) : ids.length > 4 ? `+${ids.length - 4}` : ''}
          </span>
        </span>
      )
    }
    case 'project':
    case 'anyproject':
      return (
        <span className="whitespace-nowrap">
          <span className="font-mono text-xs text-slate-400">{v}</span> <span>{lk.projectName(v)}</span>
        </span>
      )
    case 'client': return <span className="whitespace-nowrap">{lk.clientName(v)}</span>
    case 'date': return <span className="whitespace-nowrap tabular-nums">{fmtDate(v)}</span>
    case 'currency': return <span className="block text-right whitespace-nowrap tabular-nums">{fmtMoney(v)}</span>
    case 'number': return <span className="block text-right tabular-nums">{v}</span>
    case 'percent': return <Progress value={Number(v)} />
    case 'tags': return <span className="text-slate-600">{(v as string[]).join(', ')}</span>
    case 'textarea': return <span className="line-clamp-2 block max-w-xs text-slate-600" title={String(v)}>{String(v)}</span>
    default: return String(v)
  }
}

interface Props {
  readTable: string
  writeTable: string
  columns: Column[]
  entity: string
  exportName: string
  orderBy?: { column: string; ascending?: boolean }
  defaults?: Row
  rowActions?: (row: Row) => ReactNode
  onLoaded?: (rows: Row[]) => void
  toolbar?: ReactNode
  reloadToken?: number
  /** Extra content shown in the record dialog (e.g. asset history). */
  formExtra?: (row: Row | null) => ReactNode
  /** Let employees add and edit rows too (delete stays admin-only). Must match the table's RLS policies. */
  employeeCanEdit?: boolean
}

export function DataTable({ readTable, writeTable, columns, entity, exportName, orderBy, defaults, rowActions, onLoaded, toolbar, reloadToken, formExtra, employeeCanEdit }: Props) {
  const { isAdmin } = useAuth()
  const canEdit = isAdmin || !!employeeCanEdit
  const lk = useLookups()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const [editing, setEditing] = useState<Row | null | undefined>(undefined) // undefined = closed, null = new

  const load = useCallback(async () => {
    setLoading(true)
    const res = await supabase
      .from(readTable)
      .select('*')
      .order(orderBy?.column ?? 'id', { ascending: orderBy?.ascending ?? true })
    if (res.error) setError(res.error.message)
    else {
      setError(null)
      setRows(res.data ?? [])
      onLoaded?.(res.data ?? [])
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readTable, orderBy?.column, orderBy?.ascending])

  useEffect(() => { load() }, [load, reloadToken])

  const tableCols = columns.filter((c) => !c.hideInTable)
  const filterCols = columns.filter((c) => c.filter)

  const filterOptions = (c: Column): { value: string; label: string }[] => {
    if (c.type === 'employee' || c.type === 'employees') return lk.employees.map((e) => ({ value: e.id, label: e.name }))
    if (c.type === 'project') return lk.projects.map((p) => ({ value: p.id, label: `${p.id} — ${p.name}` }))
    if (c.type === 'anyproject') return [...lk.projects, ...lk.dmProjects].map((p) => ({ value: p.id, label: `${p.id} — ${p.name}` }))
    if (c.type === 'client') return lk.clients.map((p) => ({ value: p.id, label: p.company_name }))
    return (c.options ?? []).map((o) => ({ value: o, label: o }))
  }

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let out = rows.filter((r) => {
      for (const [k, v] of Object.entries(filters)) {
        if (!v) continue
        const cell = r[k]
        if (Array.isArray(cell) ? !cell.includes(v) : String(cell ?? '') !== v) return false
      }
      if (!needle) return true
      return tableCols.some((c) => displayText(c, r, lk).toLowerCase().includes(needle))
    })
    if (sort) {
      const col = columns.find((c) => c.key === sort.key)!
      out = [...out].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key]
        if (av === null || av === undefined) return 1
        if (bv === null || bv === undefined) return -1
        if (typeof av === 'number' || ['number', 'currency', 'percent'].includes(col.type ?? '')) return (Number(av) - Number(bv)) * sort.dir
        return displayText(col, a, lk).localeCompare(displayText(col, b, lk)) * sort.dir
      })
    }
    return out
  }, [rows, filters, q, sort, lk, columns, tableCols])

  const activeFilters = Object.values(filters).filter(Boolean).length

  const exportCsv = () =>
    downloadCSV(`${exportName}-${new Date().toISOString().slice(0, 10)}.csv`, tableCols.map((c) => c.label), visible.map((r) => tableCols.map((c) => displayText(c, r, lk))))

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete ${entity.toLowerCase()} ${row.id}? This cannot be undone.`)) return
    const { error } = await supabase.from(writeTable).delete().eq('id', row.id)
    if (error) return window.alert(error.message)
    await Promise.all([load(), lk.refresh()])
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute top-2.5 left-3 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${entity.toLowerCase()}s…`} className={`${inputCls} pl-9`} />
        </div>
        {filterCols.length > 0 && <SlidersHorizontal size={15} className="ml-1 hidden text-slate-400 sm:block" />}
        {filterCols.map((c) => (
          <select
            key={c.key}
            value={filters[c.key] ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, [c.key]: e.target.value }))}
            className={`rounded-lg border px-2.5 py-2 text-sm focus:outline-none ${filters[c.key] ? 'border-brand bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            <option value="">All {c.label}</option>
            {filterOptions(c).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        {activeFilters > 0 && (
          <button className={btn.ghost} onClick={() => setFilters({})}><X size={14} /> Clear</button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {toolbar}
          <button className={btn.secondary} onClick={exportCsv} title="Export the filtered rows to CSV (opens in Excel)">
            <Download size={15} /> Export
          </button>
          {canEdit && (
            <button className={btn.primary} onClick={() => setEditing(null)}>
              <Plus size={16} /> New {entity}
            </button>
          )}
        </div>
      </div>

      {error && <div className="m-3 rounded-lg bg-danger-50 p-3 text-sm text-danger-700">{error}</div>}

      {/* Table — header row and first column stay frozen while scrolling */}
      <div className="max-h-[calc(100vh-280px)] min-h-64 overflow-auto">
        {loading && !rows.length ? (
          <div className="grid h-64 place-items-center"><Spinner /></div>
        ) : !visible.length ? (
          <EmptyState text={rows.length ? 'No rows match your filters.' : `No ${entity.toLowerCase()}s yet.`} />
        ) : (
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {tableCols.map((c, i) => {
                  const active = sort?.key === c.key
                  return (
                    <th
                      key={c.key}
                      onClick={() => setSort(active ? (sort!.dir === 1 ? { key: c.key, dir: -1 } : null) : { key: c.key, dir: 1 })}
                      className={`sticky top-0 z-10 cursor-pointer border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-slate-500 uppercase select-none hover:text-navy ${i === 0 ? 'left-0 z-20' : ''} ${c.width ?? ''}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {c.computed && <span title="Calculated automatically" className="rounded bg-brand-50 px-1 text-[9px] text-brand">ƒx</span>}
                        {active ? (sort!.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={11} className="opacity-30" />}
                      </span>
                    </th>
                  )
                })}
                <th className="sticky top-0 right-0 z-10 border-b border-slate-200 bg-slate-50 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="group cursor-pointer" onClick={() => setEditing(r)}>
                  {tableCols.map((c, i) => (
                    <td
                      key={c.key}
                      className={`border-b border-slate-100 px-3 py-2.5 align-middle text-navy group-hover:bg-slate-50 ${i === 0 ? 'sticky left-0 z-[5] bg-white font-mono text-xs font-medium text-brand' : ''} ${c.width ?? ''}`}
                    >
                      {renderCell(c, r, lk)}
                    </td>
                  ))}
                  <td className="sticky right-0 border-b border-slate-100 bg-white px-2 py-2 text-right whitespace-nowrap group-hover:bg-slate-50" onClick={(e) => e.stopPropagation()}>
                    <span className="inline-flex items-center gap-0.5">
                      {rowActions?.(r)}
                      <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand" title={canEdit ? 'Edit' : 'View'} onClick={() => setEditing(r)}>
                        {canEdit ? <Pencil size={14} /> : <Eye size={14} />}
                      </button>
                      {isAdmin && (
                        <button className="rounded-md p-1.5 text-slate-400 hover:bg-danger-50 hover:text-danger" title="Delete" onClick={() => remove(r)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
        <span>Showing <b className="text-navy">{visible.length}</b> of {rows.length} {entity.toLowerCase()}s</span>
        <span className="hidden sm:inline">Click a row to {canEdit ? 'edit' : 'view details'}</span>
      </div>

      <RecordForm
        open={editing !== undefined}
        row={editing ?? null}
        columns={columns}
        writeTable={writeTable}
        entity={entity}
        readOnly={!canEdit}
        defaults={defaults}
        extra={formExtra}
        onClose={() => setEditing(undefined)}
        onSaved={async () => {
          setEditing(undefined)
          await Promise.all([load(), lk.refresh()])
        }}
      />
    </div>
  )
}
