import { ListChecks } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader } from '../components/ui'
import { TASK_DEPARTMENTS, PRIORITIES, RISK_LEVELS, TASK_CATEGORIES, TASK_HEALTH, TASK_STATUSES } from '../lib/constants'
import { fmtDateTime } from '../lib/format'
import type { Column } from '../lib/types'

const daysCell = (d: number | null) => {
  if (d === null || d === undefined) return <span className="text-slate-300">—</span>
  const cls = d < 0 ? 'text-danger-700 font-semibold' : d <= 3 ? 'text-warning-700 font-semibold' : 'text-slate-600'
  return <span className={`block text-right tabular-nums ${cls}`}>{d < 0 ? `${Math.abs(d)}d late` : `${d}d`}</span>
}

const columns: Column[] = [
  { key: 'id', label: 'Task ID', computed: true },
  { key: 'name', label: 'Task Name', required: true, width: 'min-w-56', wide: true },
  { key: 'project_id', label: 'Project', type: 'anyproject', required: true, filter: true, help: 'Dev (PRJ-…) or DM (DM-…) project.' },
  { key: 'department', label: 'Dept', type: 'select', options: TASK_DEPARTMENTS, computed: true, filter: true, hideInTable: true },
  { key: 'assigned_to', label: 'Assigned To', type: 'employees', filter: true, width: 'min-w-40' },
  { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, required: true, filter: true },
  { key: 'status', label: 'Status', type: 'select', options: TASK_STATUSES, required: true, filter: true },
  { key: 'due_date', label: 'Due Date', type: 'date' },
  { key: 'days_remaining', label: 'Days Left', computed: true, render: (r) => daysCell(r.days_remaining) },
  { key: 'health', label: 'Task Health', type: 'select', options: TASK_HEALTH, computed: true, filter: true },
  { key: 'category', label: 'Category', type: 'select', options: TASK_CATEGORIES, required: true, filter: true },
  { key: 'owner_id', label: 'Task Owner', type: 'employee' },
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'completion_date', label: 'Completed On', type: 'date', computed: true },
  { key: 'estimated_hours', label: 'Est. Hours', type: 'number', min: 0, step: 0.5, help: 'Used for team workload %.' },
  { key: 'risk', label: 'Risk', type: 'select', options: RISK_LEVELS, required: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'comments', label: 'Comments', type: 'textarea', hideInTable: true },
  { key: 'updated_at', label: 'Last Updated', computed: true, render: (r) => <span className="whitespace-nowrap text-xs text-slate-500">{fmtDateTime(r.updated_at)}</span> },
]

export default function Tasks() {
  return (
    <>
      <PageHeader
        icon={<ListChecks size={20} />}
        title="Task Management System"
        subtitle="Tasks for Dev (Web, SD, Media, Other) and DM projects. Days left and task health update automatically every day."
      />
      <DataTable
        readTable="tasks_v"
        writeTable="tasks"
        columns={columns}
        entity="Task"
        exportName="tasks"
        orderBy={{ column: 'days_remaining', ascending: true }}
        defaults={{ category: 'Development', priority: 'Medium', status: 'Backlog', risk: 'Low', assigned_to: [], estimated_hours: 0 }}
      />
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <b>Task health:</b> <Badge value="Overdue" /> past due · <Badge value="Urgent" /> due within 3 days · <Badge value="On Track" /> ·
        <Badge value="Completed" />
      </p>
    </>
  )
}
