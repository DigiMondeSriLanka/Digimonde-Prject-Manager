import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import {
  Activity, AlarmClock, CalendarClock, CheckCircle2, CircleDashed, FolderKanban, Gauge, HeartPulse, LayoutDashboard,
  ListChecks, ListTodo, Megaphone, RefreshCw, TimerOff, Users,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Badge, Card, PageHeader, Progress, Spinner, StatCard } from '../components/ui'
import { DEV_DEPARTMENTS, PRIORITIES, TASK_STATUSES } from '../lib/constants'
import { daysBetween, fmtDate, todayISO } from '../lib/format'
import type { Row } from '../lib/types'
import { healthBadge } from './ProjectsDev'

// Validated chart palette (see README → Design): series pairs pass CVD checks; status colours are reserved for state.
const C = {
  completed: '#16A34A',
  pending: '#2563EB',
  projects: '#2563EB',
  tasks: '#0D9488',
  grid: '#E2E8F0',
  axis: '#64748B',
}
const STATUS_GROUPS = [
  { name: 'Not Started', color: '#94A3B8', match: ['Planning', 'Research'] },
  { name: 'In Progress', color: '#2563EB', match: ['Development', 'Testing', 'Launch'] },
  { name: 'Completed', color: '#16A34A', match: ['Completed'] },
  { name: 'On Hold', color: '#F97316', match: ['On Hold'] },
  { name: 'Cancelled', color: '#DC2626', match: ['Cancelled'] },
]
const HEALTH_COLOR: Record<string, string> = { Green: '#16A34A', Yellow: '#F59E0B', Red: '#DC2626', Gray: '#94A3B8' }
const CLOSED = ['Completed', 'Cancelled']

const tooltipStyle = {
  contentStyle: { borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgb(15 23 42 / 0.08)', fontSize: 12, padding: '8px 10px' },
  labelStyle: { color: '#0F172A', fontWeight: 600, marginBottom: 4 },
  cursor: { fill: 'rgb(148 163 184 / 0.12)' },
}
const short = (s: string, n = 24) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

export default function Dashboard() {
  const [dev, setDev] = useState<Row[]>([])
  const [dm, setDm] = useState<Row[]>([])
  const [tasks, setTasks] = useState<Row[]>([])
  const [team, setTeam] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState<Date | null>(null)
  const [dept, setDept] = useState<string>('All')

  const load = useCallback(async () => {
    const [a, b, c, d] = await Promise.all([
      supabase.from('projects_dev_v').select('*').order('start_date'),
      supabase.from('projects_dm').select('*').order('id'),
      supabase.from('tasks_v').select('*'),
      supabase.rpc('get_team_workload'),
    ])
    setDev(a.data ?? [])
    setDm(b.data ?? [])
    setTasks(c.data ?? [])
    setTeam((d.data as Row[] | null) ?? [])
    setUpdated(new Date())
    setLoading(false)
  }, [])

  // Live updates: realtime changes, window focus and a 60s heartbeat.
  useEffect(() => {
    load()
    const channel = supabase
      .channel('dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects_dev' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects_dm' }, load)
      .subscribe()
    const t = window.setInterval(load, 60_000)
    window.addEventListener('focus', load)
    return () => {
      supabase.removeChannel(channel)
      window.clearInterval(t)
      window.removeEventListener('focus', load)
    }
  }, [load])

  const today = todayISO()
  const P = useMemo(() => (dept === 'All' ? dev : dev.filter((p) => p.department === dept)), [dev, dept])
  const T = useMemo(() => (dept === 'All' ? tasks : tasks.filter((t) => t.department === dept)), [tasks, dept])

  const k = useMemo(() => {
    const activeDev = P.filter((p) => !CLOSED.includes(p.status))
    const openTasks = T.filter((t) => t.status !== 'Completed')
    const inWeek = (d: string | null) => !!d && d >= today && daysBetween(today, d) <= 7
    const scored = activeDev.filter((p) => p.health !== 'Gray')
    const score = scored.length
      ? Math.round(scored.reduce((a, p) => a + (p.health === 'Green' ? 100 : p.health === 'Yellow' ? 60 : 20), 0) / scored.length)
      : 100
    const compl = P.filter((p) => p.status !== 'Cancelled').map((p) => Number(p.completion_pct))
    return {
      active: activeDev.length,
      completed: P.filter((p) => p.status === 'Completed').length,
      delayed: P.filter((p) => p.is_delayed).length,
      upcoming: activeDev.filter((p) => inWeek(p.target_date)).length + openTasks.filter((t) => inWeek(t.due_date)).length,
      totalTasks: T.length,
      doneTasks: T.length - openTasks.length,
      pendingTasks: openTasks.length,
      overdueTasks: T.filter((t) => t.health === 'Overdue').length,
      urgentTasks: T.filter((t) => t.health === 'Urgent').length,
      avgCompletion: compl.length ? Math.round(compl.reduce((a, b) => a + b, 0) / compl.length) : 0,
      score,
      healthCounts: ['Green', 'Yellow', 'Red'].map((h) => scored.filter((p) => p.health === h).length),
      workload: ['Underutilized', 'Balanced', 'Overloaded'].map((s) => team.filter((e) => e.workload_status === s).length),
    }
  }, [P, T, team, today])

  if (loading) return <div className="grid h-96 place-items-center"><Spinner /></div>

  const scoreTone = k.score >= 75 ? 'green' : k.score >= 50 ? 'yellow' : 'red'

  return (
    <>
      <PageHeader
        icon={<LayoutDashboard size={20} />}
        title="Executive Dashboard"
        subtitle={`Startup project health at a glance · ${new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        actions={
          <>
            <div className="inline-flex flex-wrap rounded-xl bg-white p-1 shadow-xs ring-1 ring-slate-200" role="group" aria-label="Department slicer">
              {['All', ...DEV_DEPARTMENTS].map((d) => (
                <button key={d} onClick={() => setDept(d)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${dept === d ? 'bg-navy text-white' : 'text-slate-500 hover:text-navy'}`}>
                  {d === 'All' ? 'All depts' : d}
                </button>
              ))}
            </div>
            <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-white hover:text-navy" title="Refresh now">
              <RefreshCw size={13} /> {updated?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </button>
          </>
        }
      />

      <SectionTitle icon={<FolderKanban size={15} />} title="Development projects" note={dept === 'All' ? 'Web · SD · Media · Other' : `${dept} department`} />

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active projects" value={k.active} icon={<FolderKanban size={16} />} tone="blue" hint={`of ${P.length} dev projects`} />
        <StatCard label="Completed projects" value={k.completed} icon={<CheckCircle2 size={16} />} tone="green" />
        <StatCard label="Delayed projects" value={k.delayed} icon={<TimerOff size={16} />} tone={k.delayed ? 'red' : 'green'} hint="Past target date" />
        <StatCard label="Upcoming deadlines" value={k.upcoming} icon={<CalendarClock size={16} />} tone="orange" hint="Projects & tasks due in 7 days" />
        <StatCard label="Total tasks" value={k.totalTasks} icon={<ListChecks size={16} />} tone="navy" />
        <StatCard label="Completed tasks" value={k.doneTasks} icon={<CheckCircle2 size={16} />} tone="green"
          hint={k.totalTasks ? `${Math.round((k.doneTasks / k.totalTasks) * 100)}% of all tasks` : undefined} />
        <StatCard label="Pending tasks" value={k.pendingTasks} icon={<ListTodo size={16} />} tone="blue" hint={`${k.urgentTasks} due within 3 days`} />
        <StatCard label="Overdue tasks" value={k.overdueTasks} icon={<AlarmClock size={16} />} tone={k.overdueTasks ? 'red' : 'green'} />
      </div>

      {/* Health score, completion, workload */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Project health score</p>
            <HeartPulse size={16} className="text-slate-400" />
          </div>
          <div className="mt-2 flex items-end gap-3">
            <p className="text-3xl font-bold tracking-tight text-navy tabular-nums">{k.score}<span className="text-base text-slate-400">/100</span></p>
            <Badge value={scoreTone} label={scoreTone === 'green' ? 'Healthy' : scoreTone === 'yellow' ? 'Attention needed' : 'At risk'} tone={scoreTone} />
          </div>
          <div className="mt-3 flex gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-success" />{k.healthCounts[0]} healthy</span>
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-400" />{k.healthCounts[1]} attention</span>
            <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-danger" />{k.healthCounts[2]} at risk</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Average project completion</p>
            <Gauge size={16} className="text-slate-400" />
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-navy tabular-nums">{k.avgCompletion}%</p>
          <div className="mt-3"><Progress value={k.avgCompletion} tone="blue" /></div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Team workload overview</p>
            <Users size={16} className="text-slate-400" />
          </div>
          <ul className="mt-3 space-y-2">
            {([['Underutilized', 'bg-brand', 'text-brand-700'], ['Balanced', 'bg-success', 'text-success-700'], ['Overloaded', 'bg-danger', 'text-danger-700']] as const).map(([l, bar, txt], i) => (
              <li key={l} className="flex items-center gap-3 text-xs">
                <span className={`w-24 shrink-0 font-medium ${txt}`}>{l}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span className={`block h-full rounded-full ${bar}`} style={{ width: `${team.length ? (k.workload[i] / team.length) * 100 : 0}%` }} />
                </span>
                <span className="w-6 text-right font-semibold text-navy tabular-nums">{k.workload[i]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <StatusDonut projects={P} />
        <div className="xl:col-span-2"><TaskCompletionChart projects={P} /></div>
      </div>

      <div className="mt-5"><Gantt projects={P} today={today} /></div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2"><WorkloadChart team={team} /></div>
        <PriorityChart projects={P} tasks={T} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2"><HealthTable projects={P} /></div>
        <UpcomingDeadlines projects={P} tasks={T} today={today} />
      </div>

      <div className="mt-5"><TaskPivot tasks={T} projects={P} team={team} /></div>

      <SectionTitle icon={<Megaphone size={15} />} title="Digital marketing projects" note="Separate project type — tracked by posts, not tasks" className="mt-10" />
      <DmSummary projects={dm} />
    </>
  )
}

/* ---------------- 1. Project status donut ---------------- */
function StatusDonut({ projects }: { projects: Row[] }) {
  const data = STATUS_GROUPS.map((g) => ({ name: g.name, color: g.color, value: projects.filter((p) => g.match.includes(p.status)).length }))
  const total = projects.length
  return (
    <Card title="Project status" subtitle={`${total} development projects`}>
      <div className="relative h-52">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data.filter((d) => d.value)} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="#fff" strokeWidth={2}>
              {data.filter((d) => d.value).map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={(v) => [`${v} projects`, '']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><p className="text-2xl font-bold text-navy tabular-nums">{total}</p><p className="text-[11px] text-slate-500">projects</p></div>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <i className="size-2.5 rounded-sm" style={{ background: d.color }} />
            <span className="flex-1 text-slate-600">{d.name}</span>
            <span className="font-semibold text-navy tabular-nums">{d.value}</span>
            <span className="w-10 text-right text-xs text-slate-400 tabular-nums">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ---------------- 2. Task completion bar ---------------- */
function TaskCompletionChart({ projects }: { projects: Row[] }) {
  const data = projects
    .filter((p) => p.total_tasks > 0 && p.status !== 'Cancelled')
    .map((p) => ({ name: short(p.name, 28), full: p.name, Completed: p.completed_tasks, Pending: p.remaining_tasks }))
  const done = data.reduce((a, d) => a + d.Completed, 0)
  const pend = data.reduce((a, d) => a + d.Pending, 0)
  return (
    <Card title="Task completion by project" subtitle={`${done} completed · ${pend} pending`}>
      <div style={{ height: Math.max(220, data.length * 34 + 50) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 0 }} barCategoryGap={8}>
            <CartesianGrid horizontal={false} stroke={C.grid} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 12, fill: '#334155' }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} labelFormatter={(_, p) => p?.[0]?.payload?.full ?? ''} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Completed" stackId="a" fill={C.completed} stroke="#fff" strokeWidth={1} />
            <Bar dataKey="Pending" stackId="a" fill={C.pending} radius={[0, 4, 4, 0]} stroke="#fff" strokeWidth={1} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/* ---------------- 3. Timeline / Gantt ---------------- */
function Gantt({ projects, today }: { projects: Row[]; today: string }) {
  const rows = projects.filter((p) => p.start_date && p.target_date && p.status !== 'Cancelled')
  if (!rows.length) return null
  const min = rows.reduce((m, p) => (p.start_date < m ? p.start_date : m), rows[0].start_date)
  const max = rows.reduce((m, p) => (p.target_date > m ? p.target_date : m), rows[0].target_date)
  const start = new Date(min + 'T00:00:00'); start.setDate(1)
  const end = new Date(max + 'T00:00:00'); end.setMonth(end.getMonth() + 1, 1)
  const span = end.getTime() - start.getTime()
  const pos = (iso: string) => ((Date.parse(iso + 'T00:00:00') - start.getTime()) / span) * 100
  const months: Date[] = []
  for (let d = new Date(start); d < end; d.setMonth(d.getMonth() + 1)) months.push(new Date(d))
  const todayPos = pos(today)

  return (
    <Card title="Project timeline" subtitle="Planned start → target date; the filled part shows completion %">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="ml-56 flex border-b border-slate-100 pb-1.5">
            {months.map((m) => {
              const next = new Date(m); next.setMonth(m.getMonth() + 1)
              return (
                <div key={m.toISOString()} style={{ width: `${((next.getTime() - m.getTime()) / span) * 100}%` }} className="text-[11px] font-medium text-slate-400">
                  {m.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                </div>
              )
            })}
          </div>
          <div className="relative">
            {todayPos >= 0 && todayPos <= 100 && (
              <div className="pointer-events-none absolute inset-y-0 right-0 left-56">
                <div className="absolute inset-y-0 w-px bg-danger/60" style={{ left: `${todayPos}%` }}>
                  <span className="absolute -top-0.5 -translate-x-1/2 rounded bg-danger px-1 text-[9px] font-semibold text-white">Today</span>
                </div>
              </div>
            )}
            {rows.map((p) => {
              const l = pos(p.start_date), r = pos(p.actual_date ?? p.target_date)
              const color = HEALTH_COLOR[p.health] ?? '#94A3B8'
              const pct = Number(p.completion_pct)
              return (
                <div key={p.id} className="group flex items-center py-1.5">
                  <div className="w-56 shrink-0 pr-3">
                    <p className="truncate text-sm font-medium text-navy" title={p.name}>{p.name}</p>
                    <p className="text-[11px] text-slate-400">{p.id} · {p.department}</p>
                  </div>
                  <div className="relative h-7 flex-1">
                    {months.map((m) => <div key={m.toISOString()} className="absolute inset-y-0 w-px bg-slate-100" style={{ left: `${pos(m.toISOString().slice(0, 10))}%` }} />)}
                    <div
                      className="absolute top-1 h-5 overflow-hidden rounded-md"
                      style={{ left: `${l}%`, width: `${Math.max(r - l, 1)}%`, background: `${color}26`, boxShadow: `inset 0 0 0 1px ${color}66` }}
                      title={`${p.name}\n${fmtDate(p.start_date)} → ${fmtDate(p.target_date)}\n${pct}% complete · ${p.status}`}
                    >
                      <div className="h-full rounded-md" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="absolute top-1.5 text-[11px] font-semibold text-slate-600 tabular-nums" style={{ left: `calc(${r}% + 6px)` }}>{Math.round(pct)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 ml-56 flex flex-wrap gap-4 text-[11px] text-slate-600">
            {[['Green', 'Healthy'], ['Yellow', 'Attention'], ['Red', 'At risk / delayed']].map(([h, l]) => (
              <span key={h} className="flex items-center gap-1.5"><i className="h-2.5 w-4 rounded-sm" style={{ background: HEALTH_COLOR[h] }} />{l}</span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

/* ---------------- 4. Team workload ---------------- */
function WorkloadChart({ team }: { team: Row[] }) {
  const data = team
    .filter((e) => e.assigned_tasks > 0)
    .sort((a, b) => b.pending_tasks - a.pending_tasks)
    .map((e) => ({ name: e.name, Completed: Number(e.completed_tasks), Pending: Number(e.pending_tasks), pct: e.workload_pct, status: e.workload_status }))
  return (
    <Card title="Team workload" subtitle="Assigned tasks per person — completed vs pending" action={<Link to="/tasks" className="text-xs font-medium text-brand hover:underline">View tasks</Link>}>
      <div style={{ height: Math.max(240, data.length * 28 + 50) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 0 }} barCategoryGap={6}>
            <CartesianGrid horizontal={false} stroke={C.grid} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12, fill: '#334155' }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} formatter={(v, n) => [v, n]} labelFormatter={(l, p) => `${l} · workload ${p?.[0]?.payload?.pct ?? 0}% (${p?.[0]?.payload?.status ?? ''})`} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Completed" stackId="a" fill={C.completed} stroke="#fff" strokeWidth={1} />
            <Bar dataKey="Pending" stackId="a" fill={C.pending} radius={[0, 4, 4, 0]} stroke="#fff" strokeWidth={1} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/* ---------------- 5. Priority distribution ---------------- */
function PriorityChart({ projects, tasks }: { projects: Row[]; tasks: Row[] }) {
  const data = PRIORITIES.map((p) => ({
    name: p,
    'Active projects': projects.filter((x) => x.priority === p && !CLOSED.includes(x.status)).length,
    'Open tasks': tasks.filter((x) => x.priority === p && x.status !== 'Completed').length,
  }))
  return (
    <Card title="Priority distribution" subtitle="Active projects and open tasks">
      <div className="h-72">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -20, right: 4, top: 8, bottom: 0 }} barGap={2} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke={C.grid} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.axis }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Active projects" fill={C.projects} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Open tasks" fill={C.tasks} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/* ---------------- Health table (conditional formatting) ---------------- */
function HealthTable({ projects }: { projects: Row[] }) {
  const rows = projects.filter((p) => p.status !== 'Cancelled')
  const rowTint: Record<string, string> = { Red: 'bg-danger-50/60', Yellow: 'bg-amber-50/60', Green: '' }
  return (
    <Card title="Project health" subtitle="Green = healthy · Yellow = attention needed · Red = risk / delayed"
      action={<Link to="/projects" className="text-xs font-medium text-brand hover:underline">All projects</Link>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] tracking-wide text-slate-500 uppercase">
              <th className="px-2 py-2 font-semibold">Project</th>
              <th className="px-2 py-2 font-semibold">Status</th>
              <th className="px-2 py-2 font-semibold">Target</th>
              <th className="px-2 py-2 font-semibold">Progress</th>
              <th className="px-2 py-2 text-right font-semibold">Overdue</th>
              <th className="px-2 py-2 font-semibold">Health</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className={`border-t border-slate-100 ${rowTint[p.health] ?? ''}`}>
                <td className="px-2 py-2"><p className="font-medium text-navy">{p.name}</p><p className="text-[11px] text-slate-400">{p.id} · {p.department}</p></td>
                <td className="px-2 py-2"><Badge value={p.status} /></td>
                <td className="px-2 py-2 whitespace-nowrap tabular-nums">
                  {fmtDate(p.target_date)}
                  {p.days_to_deadline !== null && (
                    <span className={`block text-[11px] ${p.days_to_deadline < 0 ? 'text-danger-700' : 'text-slate-400'}`}>
                      {p.days_to_deadline < 0 ? `${-p.days_to_deadline}d late` : `${p.days_to_deadline}d left`}
                    </span>
                  )}
                </td>
                <td className="px-2 py-2"><Progress value={Number(p.completion_pct)} /></td>
                <td className={`px-2 py-2 text-right tabular-nums ${p.overdue_tasks ? 'font-semibold text-danger-700' : 'text-slate-400'}`}>{p.overdue_tasks}</td>
                <td className="px-2 py-2">{healthBadge(p.health)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function UpcomingDeadlines({ projects, tasks, today }: { projects: Row[]; tasks: Row[]; today: string }) {
  const items = [
    ...projects.filter((p) => !CLOSED.includes(p.status) && p.target_date).map((p) => ({ id: p.id, name: p.name, date: p.target_date as string, kind: 'Project', sub: p.department })),
    ...tasks.filter((t) => t.status !== 'Completed' && t.due_date).map((t) => ({ id: t.id, name: t.name, date: t.due_date as string, kind: 'Task', sub: t.project_name })),
  ]
    .filter((i) => daysBetween(today, i.date) <= 14)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 12)
  return (
    <Card title="Deadlines — next 14 days" subtitle="Including anything already overdue">
      <ul className="divide-y divide-slate-100">
        {items.map((i) => {
          const d = daysBetween(today, i.date)
          const tone = d < 0 ? 'red' : d <= 3 ? 'orange' : 'blue'
          return (
            <li key={i.id} className="flex items-center gap-3 py-2">
              {i.kind === 'Project' ? <FolderKanban size={15} className="shrink-0 text-slate-400" /> : <CircleDashed size={15} className="shrink-0 text-slate-400" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy" title={i.name}>{i.name}</p>
                <p className="truncate text-[11px] text-slate-400">{i.id} · {i.sub}</p>
              </div>
              <Badge value={i.date} tone={tone} label={d < 0 ? `${-d}d late` : d === 0 ? 'Today' : `${d}d`} />
            </li>
          )
        })}
        {!items.length && <li className="py-8 text-center text-sm text-slate-400">Nothing due — nice.</li>}
      </ul>
    </Card>
  )
}

/* ---------------- 6. DM progress summary ---------------- */
function DmSummary({ projects }: { projects: Row[] }) {
  const active = projects.filter((p) => p.status === 'Active')
  const inactive = projects.filter((p) => p.status !== 'Active')
  const planned = active.reduce((a, p) => a + p.posts_per_month, 0)
  const published = active.reduce((a, p) => a + p.published_posts, 0)
  const remaining = active.reduce((a, p) => a + p.remaining_posts, 0)
  const avg = planned ? Math.round((Math.min(published, planned) / planned) * 100) : 0
  const behind = active.filter((p) => Number(p.completion_pct) < 40).length
  const Stat = ({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) => (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="text-xl font-bold text-navy tabular-nums">{value}</p>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
  const row = (p: Row) => {
    const pct = Number(p.completion_pct)
    const on = p.status === 'Active'
    const tone = !on ? 'gray' : pct >= 75 ? 'green' : pct >= 40 ? 'yellow' : 'red'
    return (
      <div key={p.id} className={`grid grid-cols-1 items-center gap-1 sm:grid-cols-[minmax(0,1fr)_90px_minmax(0,1.2fr)_90px] sm:gap-4 ${on ? '' : 'opacity-60'}`}>
        <div className="min-w-0"><p className="truncate text-sm font-medium text-navy">{p.name}</p><p className="text-[11px] text-slate-400">{p.id}</p></div>
        <Badge value={p.status} tone={on ? 'green' : 'gray'} />
        <Progress value={pct} tone={tone} />
        <span className="text-xs text-slate-500 tabular-nums sm:text-right">{p.published_posts} / {p.posts_per_month} posts</span>
      </div>
    )
  }
  return (
    <Card title="Posting progress this month" subtitle="Totals count active DM projects only"
      action={<Link to="/dm" className="text-xs font-medium text-brand hover:underline">All DM projects</Link>}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Active DM projects" value={active.length} hint={`${inactive.length} inactive`} />
        <Stat label="Posts planned / month" value={planned} />
        <Stat label="Published" value={published} />
        <Stat label="Remaining" value={remaining} />
        <Stat label="Overall completion" value={`${avg}%`} hint="Published ÷ planned" />
        <Stat label="Behind plan" value={behind} hint="Below 40% published" />
      </div>
      <div className="mt-5 space-y-3">{active.map(row)}</div>
      {inactive.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Inactive</p>
          <div className="space-y-3">{inactive.map(row)}</div>
        </>
      )}
    </Card>
  )
}

function SectionTitle({ icon, title, note, className = 'mt-2' }: { icon: ReactNode; title: string; note?: string; className?: string }) {
  return (
    <div className={`mb-3 flex items-center gap-2 ${className}`}>
      <span className="grid size-6 place-items-center rounded-md bg-navy text-white">{icon}</span>
      <h2 className="text-sm font-semibold text-navy">{title}</h2>
      {note && <span className="text-xs text-slate-400">· {note}</span>}
    </div>
  )
}

/* ---------------- Pivot table ---------------- */
const PIVOT_DIMS = ['Project', 'Assignee', 'Category', 'Priority', 'Department'] as const
type Dim = (typeof PIVOT_DIMS)[number]

function TaskPivot({ tasks, projects, team }: { tasks: Row[]; projects: Row[]; team: Row[] }) {
  const [dim, setDim] = useState<Dim>('Project')
  const names = new Map(team.map((e) => [e.id, e.name]))
  const pname = new Map(projects.map((p) => [p.id, p.name]))
  const keysOf = (t: Row): string[] => {
    switch (dim) {
      case 'Project': return [pname.get(t.project_id) ?? t.project_id]
      case 'Assignee': return t.assigned_to?.length ? t.assigned_to.map((id: string) => names.get(id) ?? id) : ['Unassigned']
      case 'Category': return [t.category]
      case 'Priority': return [t.priority]
      case 'Department': return [t.department]
    }
  }
  const table = new Map<string, Record<string, number>>()
  for (const t of tasks) for (const key of keysOf(t)) {
    const r = table.get(key) ?? {}
    r[t.status] = (r[t.status] ?? 0) + 1
    table.set(key, r)
  }
  const rows = [...table.entries()].map(([k, v]) => ({ k, v, total: Object.values(v).reduce((a, b) => a + b, 0) })).sort((a, b) => b.total - a.total)
  const max = Math.max(1, ...rows.flatMap((r) => Object.values(r.v)))
  const colTotal = (s: string) => rows.reduce((a, r) => a + (r.v[s] ?? 0), 0)

  return (
    <Card
      title={<span className="flex items-center gap-2"><Activity size={15} className="text-brand" /> Task pivot</span>}
      subtitle={`Tasks by ${dim.toLowerCase()} × status${dim === 'Assignee' ? ' (a task with several assignees counts once per person)' : ''}`}
      action={
        <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-0.5">
          {PIVOT_DIMS.map((d) => (
            <button key={d} onClick={() => setDim(d)} className={`rounded-md px-2.5 py-1 text-xs font-medium ${dim === d ? 'bg-white text-navy shadow-xs' : 'text-slate-500'}`}>{d}</button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] tracking-wide text-slate-500 uppercase">
              <th className="px-2 py-2 text-left font-semibold">{dim}</th>
              {TASK_STATUSES.map((s) => <th key={s} className="px-2 py-2 text-right font-semibold whitespace-nowrap">{s}</th>)}
              <th className="px-2 py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} className="border-t border-slate-100">
                <td className="px-2 py-1.5 font-medium whitespace-nowrap text-navy">{r.k}</td>
                {TASK_STATUSES.map((s) => {
                  const n = r.v[s] ?? 0
                  return (
                    <td key={s} className="px-1 py-1 text-right tabular-nums">
                      <span className="block rounded px-1.5 py-0.5" style={n ? { background: `rgb(37 99 235 / ${0.06 + (n / max) * 0.3})`, color: '#0F172A' } : { color: '#CBD5E1' }}>
                        {n || '·'}
                      </span>
                    </td>
                  )
                })}
                <td className="px-2 py-1.5 text-right font-semibold text-navy tabular-nums">{r.total}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-200 font-semibold">
              <td className="px-2 py-2 text-navy">Total</td>
              {TASK_STATUSES.map((s) => <td key={s} className="px-2 py-2 text-right text-navy tabular-nums">{colTotal(s)}</td>)}
              <td className="px-2 py-2 text-right text-navy tabular-nums">{rows.reduce((a, r) => a + r.total, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  )
}
