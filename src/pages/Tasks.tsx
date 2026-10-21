import { useCallback, useEffect, useMemo, useState, type DragEvent, type ReactNode } from 'react'
import {
  AlertTriangle, CalendarClock, CheckCircle2, ChevronDown, Download, Inbox, Kanban, LayoutList, ListChecks, Plus, Search, Trash2, X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLookups } from '../context/LookupsContext'
import { RecordForm } from '../components/RecordForm'
import { displayText } from '../components/DataTable'
import { Avatar, Badge, EmptyState, PageHeader, Spinner, btn, inputCls } from '../components/ui'
import { TASK_DEPARTMENTS, PRIORITIES, RISK_LEVELS, TASK_CATEGORIES, TASK_HEALTH, TASK_STATUSES } from '../lib/constants'
import { downloadCSV, fmtDate } from '../lib/format'
import type { Column, Row } from '../lib/types'

// Form order = what people fill in most often first.
const columns: Column[] = [
  { key: 'id', label: 'Task ID', computed: true },
  { key: 'name', label: 'Task Name', required: true, wide: true },
  { key: 'project_id', label: 'Project', type: 'anyproject', required: true, wide: true, help: 'Dev (PRJ-…) or DM (DM-…) project.' },
  { key: 'status', label: 'Status', type: 'select', options: TASK_STATUSES, required: true },
  { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, required: true },
  { key: 'assigned_to', label: 'Assigned To', type: 'employees' },
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'due_date', label: 'Due Date', type: 'date' },
  { key: 'category', label: 'Category', type: 'select', options: TASK_CATEGORIES, required: true },
  { key: 'risk', label: 'Risk', type: 'select', options: RISK_LEVELS, required: true },
  { key: 'owner_id', label: 'Task Owner', type: 'employee' },
  { key: 'estimated_hours', label: 'Est. Hours', type: 'number', min: 0, step: 0.5, help: 'Used for team workload %.' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'comments', label: 'Comments', type: 'textarea' },
  { key: 'department', label: 'Dept', type: 'select', options: TASK_DEPARTMENTS, computed: true },
  { key: 'days_remaining', label: 'Days Left', computed: true, render: (r) => <DueChip row={r} /> },
  { key: 'health', label: 'Task Health', type: 'select', options: TASK_HEALTH, computed: true },
  { key: 'completion_date', label: 'Completed On', type: 'date', computed: true },
]

const DEFAULTS = { category: 'Development', priority: 'Medium', status: 'Backlog', risk: 'Low', assigned_to: [], estimated_hours: 0 }

const EXPORT_KEYS = ['id', 'name', 'project_id', 'department', 'assigned_to', 'priority', 'status', 'due_date', 'days_remaining', 'health', 'category', 'owner_id', 'start_date', 'completion_date', 'estimated_hours', 'risk', 'description', 'comments']

type Focus = 'open' | 'overdue' | 'urgent' | 'done' | 'all'
type View = 'board' | 'list'

const STATUS_DOT: Record<string, string> = {
  Backlog: 'bg-slate-400', Assigned: 'bg-sky-500', 'In Progress': 'bg-brand', Review: 'bg-warning',
  Testing: 'bg-indigo-500', Blocked: 'bg-danger', Completed: 'bg-success',
}

const HEALTH_EDGE: Record<string, string> = {
  Overdue: 'border-l-danger', Urgent: 'border-l-warning', 'On Track': 'border-l-brand', Completed: 'border-l-success',
}

const PRIORITY_RANK: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 }

function readView(): View {
  try { return localStorage.getItem('tasks.view') === 'list' ? 'list' : 'board' } catch { return 'board' }
}

function DueChip({ row }: { row: Row }) {
  if (row.status === 'Completed') {
    return <span className="inline-flex items-center gap-1 text-xs text-success-700"><CheckCircle2 size={13} /> Done</span>
  }
  if (!row.due_date) return <span className="text-xs text-slate-400">No due date</span>
  const d = row.days_remaining as number
  const [cls, text] =
    d < 0 ? ['bg-danger-50 text-danger-700', `${Math.abs(d)}d overdue`]
    : d === 0 ? ['bg-warning-50 text-warning-700', 'Due today']
    : d <= 3 ? ['bg-warning-50 text-warning-700', `Due in ${d}d`]
    : ['bg-slate-100 text-slate-600', fmtDate(row.due_date)]
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums ${cls}`}>
      <CalendarClock size={12} /> {text}
    </span>
  )
}

function Assignees({ ids, max = 3 }: { ids: string[]; max?: number }) {
  const lk = useLookups()
  if (!ids?.length) return <span className="text-xs text-slate-400">Unassigned</span>
  return (
    <span className="flex items-center" title={ids.map(lk.employeeName).join(', ')}>
      <span className="flex -space-x-1.5">
        {ids.slice(0, max).map((id) => <Avatar key={id} id={id} name={lk.employeeName(id)} />)}
      </span>
      {ids.length > max && <span className="ml-1 text-xs text-slate-500">+{ids.length - max}</span>}
    </span>
  )
}

function SummaryTile({ label, value, icon, active, onClick, tone }: {
  label: string; value: number; icon: ReactNode; active: boolean; onClick: () => void; tone: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm ${active ? 'border-brand ring-2 ring-brand/15' : 'border-slate-200/80'}`}
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>{icon}</span>
      <span>
        <span className="block text-2xl font-bold leading-none tracking-tight text-navy tabular-nums">{value}</span>
        <span className="mt-1 block text-xs font-medium text-slate-500">{label}</span>
      </span>
    </button>
  )
}

function TaskCard({ row, onOpen, draggable }: { row: Row; onOpen: () => void; draggable: boolean }) {
  const lk = useLookups()
  const done = row.status === 'Completed'
  return (
    <div
      draggable={draggable}
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', row.id); e.dataTransfer.effectAllowed = 'move' }}
      onClick={onOpen}
      className={`group cursor-pointer rounded-xl border border-l-4 border-slate-200/80 bg-white p-3 shadow-xs transition hover:border-slate-300 hover:shadow-md ${HEALTH_EDGE[row.health] ?? 'border-l-slate-300'} ${done ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-slate-400">{row.id}</span>
        <Badge value={row.priority} />
      </div>
      <p className={`mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-navy ${done ? 'line-through decoration-slate-300' : ''}`}>{row.name}</p>
      <p className="mt-1 truncate text-xs text-slate-500" title={lk.projectName(row.project_id)}>{lk.projectName(row.project_id)}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <DueChip row={row} />
        <Assignees ids={row.assigned_to ?? []} />
      </div>
    </div>
  )
}

export default function Tasks() {
  const { isAdmin, profile } = useAuth()
  const lk = useLookups()
  const myId = profile?.employee_id ?? null

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Row | null | undefined>(undefined) // undefined = closed, null = new

  const [view, setView] = useState<View>(readView)
  const [focus, setFocus] = useState<Focus>('open')
  const [mine, setMine] = useState(false)
  const [q, setQ] = useState('')
  const [project, setProject] = useState('')
  const [priority, setPriority] = useState('')
  const [assignee, setAssignee] = useState('')
  const [category, setCategory] = useState('')
  const [dept, setDept] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await supabase.from('tasks_v').select('*').order('days_remaining', { ascending: true })
    if (res.error) setError(res.error.message)
    else { setError(null); setRows(res.data ?? []) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const changeView = (v: View) => {
    setView(v)
    try { localStorage.setItem('tasks.view', v) } catch { /* ignore */ }
  }

  // Everything except the summary focus, so the tiles show counts for the current filters.
  const base = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (mine && myId && !(r.assigned_to ?? []).includes(myId) && r.owner_id !== myId) return false
      if (project && r.project_id !== project) return false
      if (priority && r.priority !== priority) return false
      if (assignee && !(r.assigned_to ?? []).includes(assignee)) return false
      if (category && r.category !== category) return false
      if (dept && r.department !== dept) return false
      if (!needle) return true
      return [r.id, r.name, lk.projectName(r.project_id), ...(r.assigned_to ?? []).map(lk.employeeName)]
        .some((s) => String(s ?? '').toLowerCase().includes(needle))
    })
  }, [rows, q, mine, myId, project, priority, assignee, category, dept, lk])

  const counts = useMemo(() => ({
    open: base.filter((r) => r.status !== 'Completed').length,
    overdue: base.filter((r) => r.health === 'Overdue').length,
    urgent: base.filter((r) => r.health === 'Urgent').length,
    done: base.filter((r) => r.status === 'Completed').length,
  }), [base])

  const visible = useMemo(() => base.filter((r) => {
    switch (focus) {
      case 'open': return r.status !== 'Completed'
      case 'overdue': return r.health === 'Overdue'
      case 'urgent': return r.health === 'Urgent'
      case 'done': return r.status === 'Completed'
      default: return true
    }
  }), [base, focus])

  const listRows = useMemo(() => [...visible].sort((a, b) => {
    const ad = a.days_remaining ?? Infinity, bd = b.days_remaining ?? Infinity
    return ad - bd || (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9)
  }), [visible])

  const boardStatuses = focus === 'open' || focus === 'overdue' || focus === 'urgent'
    ? TASK_STATUSES.filter((s) => s !== 'Completed')
    : focus === 'done' ? ['Completed'] : TASK_STATUSES

  const moreActive = [assignee, category, dept].filter(Boolean).length
  const anyFilter = !!(q || mine || project || priority || moreActive)
  const clearAll = () => { setQ(''); setMine(false); setProject(''); setPriority(''); setAssignee(''); setCategory(''); setDept('') }

  const moveTo = async (id: string, status: string) => {
    const row = rows.find((r) => r.id === id)
    if (!row || row.status === status) return
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
    const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
    if (error) window.alert(error.code === '42501' ? 'You do not have permission to change this task.' : error.message)
    await load()
  }

  const remove = async (row: Row) => {
    if (!window.confirm(`Delete task ${row.id}? This cannot be undone.`)) return
    const { error } = await supabase.from('tasks').delete().eq('id', row.id)
    if (error) return window.alert(error.message)
    await Promise.all([load(), lk.refresh()])
  }

  const exportCsv = () => {
    const cols = EXPORT_KEYS.map((k) => columns.find((c) => c.key === k)!)
    downloadCSV(`tasks-${new Date().toISOString().slice(0, 10)}.csv`, cols.map((c) => c.label), listRows.map((r) => cols.map((c) => displayText(c, r, lk))))
  }

  const projectOptions = [...lk.projects, ...lk.dmProjects]
  const selCls = (on: boolean) =>
    `rounded-lg border px-2.5 py-2 text-sm focus:outline-none ${on ? 'border-brand bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600'}`

  return (
    <>
      <PageHeader
        icon={<ListChecks size={20} />}
        title="Tasks"
        subtitle="Plan, track and finish work across Dev and DM projects."
        actions={
          <>
            <button className={btn.secondary} onClick={exportCsv} title="Export the tasks you see to CSV (opens in Excel)">
              <Download size={15} /> Export
            </button>
            <button className={btn.primary} onClick={() => setEditing(null)}>
              <Plus size={16} /> New Task
            </button>
          </>
        }
      />

      {/* Summary — click a tile to focus on it */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile label="Open tasks" value={counts.open} icon={<Inbox size={18} />} tone="bg-brand-50 text-brand-700" active={focus === 'open'} onClick={() => setFocus('open')} />
        <SummaryTile label="Overdue" value={counts.overdue} icon={<AlertTriangle size={18} />} tone="bg-danger-50 text-danger-700" active={focus === 'overdue'} onClick={() => setFocus(focus === 'overdue' ? 'open' : 'overdue')} />
        <SummaryTile label="Due in 3 days" value={counts.urgent} icon={<CalendarClock size={18} />} tone="bg-warning-50 text-warning-700" active={focus === 'urgent'} onClick={() => setFocus(focus === 'urgent' ? 'open' : 'urgent')} />
        <SummaryTile label="Completed" value={counts.done} icon={<CheckCircle2 size={18} />} tone="bg-success-50 text-success-700" active={focus === 'done'} onClick={() => setFocus(focus === 'done' ? 'open' : 'done')} />
      </div>

      {/* Toolbar */}
      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute top-2.5 left-3 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks, projects, people…" className={`${inputCls} pl-9`} />
          </div>

          {myId && (
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-sm">
              {[{ v: false, l: 'Everyone' }, { v: true, l: 'My tasks' }].map((o) => (
                <button key={o.l} onClick={() => setMine(o.v)}
                  className={`rounded-md px-3 py-1.5 font-medium ${mine === o.v ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-navy'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          )}

          <select value={project} onChange={(e) => setProject(e.target.value)} className={`${selCls(!!project)} max-w-56`}>
            <option value="">All projects</option>
            {projectOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selCls(!!priority)}>
            <option value="">Any priority</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className={btn.ghost} onClick={() => setMoreOpen((o) => !o)}>
            More filters{moreActive > 0 && <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold text-white">{moreActive}</span>}
            <ChevronDown size={14} className={`transition ${moreOpen ? 'rotate-180' : ''}`} />
          </button>
          {anyFilter && <button className={btn.ghost} onClick={clearAll}><X size={14} /> Clear</button>}

          <div className="ml-auto inline-flex rounded-lg bg-slate-100 p-0.5 text-sm">
            {([['board', 'Board', Kanban], ['list', 'List', LayoutList]] as const).map(([v, l, Icon]) => (
              <button key={v} onClick={() => changeView(v)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium ${view === v ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-navy'}`}>
                <Icon size={15} /> {l}
              </button>
            ))}
          </div>
        </div>

        {moreOpen && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={selCls(!!assignee)}>
              <option value="">Anyone assigned</option>
              {lk.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={selCls(!!category)}>
              <option value="">All categories</option>
              {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={dept} onChange={(e) => setDept(e.target.value)} className={selCls(!!dept)}>
              <option value="">All departments</option>
              {TASK_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}
      </div>

      {error && <div className="mb-4 rounded-lg bg-danger-50 p-3 text-sm text-danger-700">{error}</div>}

      {loading && !rows.length ? (
        <div className="grid h-64 place-items-center"><Spinner /></div>
      ) : view === 'board' ? (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
          {boardStatuses.map((status) => {
            const items = visible.filter((r) => r.status === status)
            return (
              <section
                key={status}
                onDragOver={(e: DragEvent) => { e.preventDefault(); setDragOver(status) }}
                onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
                onDrop={(e: DragEvent) => { e.preventDefault(); setDragOver(null); moveTo(e.dataTransfer.getData('text/plain'), status) }}
                className={`flex w-72 shrink-0 flex-col rounded-2xl border p-2 transition ${dragOver === status ? 'border-brand bg-brand-50/60' : 'border-transparent bg-slate-100/70'}`}
              >
                <header className="flex items-center justify-between px-2 py-1.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <span className={`size-2 rounded-full ${STATUS_DOT[status]}`} /> {status}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 tabular-nums">{items.length}</span>
                </header>
                <div className="flex max-h-[calc(100vh-380px)] min-h-24 flex-col gap-2 overflow-y-auto p-0.5">
                  {items.length ? items.map((r) => <TaskCard key={r.id} row={r} draggable onOpen={() => setEditing(r)} />)
                    : <p className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">Drop tasks here</p>}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          {!listRows.length ? (
            <EmptyState text={rows.length ? 'No tasks match your filters.' : 'No tasks yet — create your first one.'} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {listRows.map((r) => (
                <li key={r.id} onClick={() => setEditing(r)}
                  className={`group flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 border-l-4 px-4 py-3 hover:bg-slate-50 ${HEALTH_EDGE[r.health] ?? 'border-l-slate-300'}`}>
                  <div className="min-w-0 flex-1 basis-64">
                    <p className={`truncate text-sm font-semibold text-navy ${r.status === 'Completed' ? 'line-through decoration-slate-300' : ''}`}>{r.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      <span className="font-mono text-slate-400">{r.id}</span> · {lk.projectName(r.project_id)}
                    </p>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                    <span className="w-24"><Badge value={r.status} /></span>
                    <span className="w-20"><Badge value={r.priority} /></span>
                    <span className="w-24"><Assignees ids={r.assigned_to ?? []} /></span>
                    <span className="w-28"><DueChip row={r} /></span>
                    {isAdmin && (
                      <button title="Delete" onClick={(e) => { e.stopPropagation(); remove(r) }}
                        className="rounded-md p-1.5 text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-danger-50 hover:text-danger focus:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Showing <b className="text-navy">{visible.length}</b> of {rows.length} tasks
        {view === 'board' && ' · Drag a card to another column to change its status'} · Click a task to open it
      </p>

      <RecordForm
        open={editing !== undefined}
        row={editing ?? null}
        columns={columns}
        writeTable="tasks"
        entity="Task"
        readOnly={false}
        defaults={DEFAULTS}
        onClose={() => setEditing(undefined)}
        onSaved={async () => {
          setEditing(undefined)
          await Promise.all([load(), lk.refresh()])
        }}
      />
    </>
  )
}
