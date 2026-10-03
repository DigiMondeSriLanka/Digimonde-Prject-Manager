import { useState } from 'react'
import { Users } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { PageHeader, StatCard } from '../components/ui'
import { EMP_DEPARTMENTS, EMPLOYMENT_STATUSES, WORKLOAD_STATUSES } from '../lib/constants'
import type { Column, Row } from '../lib/types'
import { Gauge, TrendingDown, TrendingUp } from 'lucide-react'

const workloadCell = (r: Row) => {
  const pct = Number(r.workload_pct ?? 0)
  const color = r.workload_status === 'Overloaded' ? 'bg-danger' : r.workload_status === 'Underutilized' ? 'bg-brand' : 'bg-success'
  return (
    <div className="flex min-w-32 items-center gap-2" title={`${r.assigned_hours}h assigned of ${r.capacity_hours}h available`}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="w-11 text-right text-xs font-medium tabular-nums">{pct}%</span>
    </div>
  )
}

const columns: Column[] = [
  { key: 'id', label: 'Employee ID', computed: true },
  { key: 'name', label: 'Name', required: true, width: 'min-w-44' },
  { key: 'role_title', label: 'Role', width: 'min-w-44' },
  { key: 'department', label: 'Department', type: 'select', options: EMP_DEPARTMENTS, filter: true },
  { key: 'workload_pct', label: 'Workload %', computed: true, render: workloadCell },
  { key: 'workload_status', label: 'Workload Status', type: 'select', options: WORKLOAD_STATUSES, computed: true, filter: true },
  { key: 'assigned_tasks', label: 'Assigned', type: 'number', computed: true },
  { key: 'completed_tasks', label: 'Completed', type: 'number', computed: true },
  { key: 'availability_pct', label: 'Availability %', type: 'number', min: 0, max: 100, help: 'Share of the employee’s time available for project work.' },
  { key: 'current_projects', label: 'Current Projects', type: 'tags', computed: true, width: 'min-w-72' },
  { key: 'skill_area', label: 'Skill Area', width: 'min-w-44' },
  { key: 'email', label: 'Email', type: 'email', hideInTable: true },
  { key: 'phone', label: 'Phone', hideInTable: true },
  { key: 'available_hours', label: 'Available Hours', type: 'number', min: 0, hideInTable: true, help: 'Capacity for the planning period (default 80h = 2-week sprint).' },
  { key: 'employment_status', label: 'Employment', type: 'select', options: EMPLOYMENT_STATUSES, required: true, filter: true, hideInTable: true },
  { key: 'join_date', label: 'Join Date', type: 'date', hideInTable: true },
  { key: 'assigned_hours', label: 'Assigned Hours', type: 'number', computed: true, hideInTable: true },
  { key: 'performance_notes', label: 'Performance Notes', type: 'textarea', hideInTable: true },
]

export default function Team() {
  const [rows, setRows] = useState<Row[]>([])
  const count = (s: string) => rows.filter((r) => r.workload_status === s).length
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + Number(r.workload_pct), 0) / rows.length) : 0
  return (
    <>
      <PageHeader icon={<Users size={20} />} title="Team Resource Management"
        subtitle="Workload % = open task hours ÷ (available hours × availability %). Under 60% = underutilized, over 100% = overloaded." />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Team members" value={rows.length} icon={<Users size={16} />} />
        <StatCard label="Average workload" value={`${avg}%`} icon={<Gauge size={16} />} tone={avg > 100 ? 'red' : avg < 60 ? 'blue' : 'green'} />
        <StatCard label="Overloaded" value={count('Overloaded')} icon={<TrendingUp size={16} />} tone="red" hint="Consider re-assigning work" />
        <StatCard label="Underutilized" value={count('Underutilized')} icon={<TrendingDown size={16} />} tone="blue" hint="Capacity available" />
      </div>
      <DataTable readTable="employees_v" writeTable="employees" columns={columns} entity="Employee" exportName="team"
        onLoaded={setRows} defaults={{ availability_pct: 100, available_hours: 80, employment_status: 'Active' }} />
    </>
  )
}
