import { FolderKanban } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader } from '../components/ui'
import { DEV_DEPARTMENTS, HEALTH_LABEL, PRIORITIES, PROJECT_STATUSES, RISK_LEVELS } from '../lib/constants'
import type { Column } from '../lib/types'

export const healthBadge = (h: string | null) =>
  h ? <Badge value={h} label={HEALTH_LABEL[h] ?? h} tone={h === 'Green' ? 'green' : h === 'Yellow' ? 'yellow' : h === 'Red' ? 'red' : 'gray'} /> : null

const columns: Column[] = [
  { key: 'id', label: 'Project ID', computed: true },
  { key: 'name', label: 'Project Name', required: true, width: 'min-w-56' },
  { key: 'department', label: 'Department', type: 'select', options: DEV_DEPARTMENTS, required: true, filter: true },
  { key: 'status', label: 'Status', type: 'select', options: PROJECT_STATUSES, required: true, filter: true },
  { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, required: true, filter: true },
  { key: 'completion_pct', label: 'Completion', type: 'percent', computed: true },
  { key: 'health', label: 'Project Health', computed: true, render: (r) => healthBadge(r.health) },
  { key: 'target_date', label: 'Target Completion', type: 'date' },
  { key: 'total_tasks', label: 'Tasks', type: 'number', computed: true },
  { key: 'completed_tasks', label: 'Completed', type: 'number', computed: true },
  { key: 'remaining_tasks', label: 'Remaining', type: 'number', computed: true },
  { key: 'manager_id', label: 'Project Manager', type: 'employee', filter: true },
  { key: 'owner_id', label: 'Project Owner', type: 'employee', filter: true },
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'actual_date', label: 'Actual Completion', type: 'date', help: 'Filled automatically when status becomes Completed.' },
  { key: 'budget', label: 'Budget', type: 'currency', min: 0 },
  { key: 'risk_level', label: 'Risk Level', type: 'select', options: RISK_LEVELS, required: true },
  { key: 'client_id', label: 'Client', type: 'client', hideInTable: true },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'objective', label: 'Startup Objective', type: 'textarea', hideInTable: true },
  { key: 'dependencies', label: 'Dependencies', hideInTable: true, wide: true },
  { key: 'notes', label: 'Notes', type: 'textarea', hideInTable: true },
]

export default function ProjectsDev() {
  return (
    <>
      <PageHeader
        icon={<FolderKanban size={20} />}
        title="Project Master Database — Dev"
        subtitle="Web, Software Development, Media and other projects. Task counts and completion % come straight from the task tracker."
      />
      <DataTable
        readTable="projects_dev_v"
        writeTable="projects_dev"
        columns={columns}
        entity="Project"
        exportName="projects-dev"
        defaults={{ department: 'Web', priority: 'Medium', status: 'Planning', risk_level: 'Low', budget: 0 }}
      />
      <p className="mt-3 text-xs text-slate-500">
        <b>Project health:</b> <span className="text-danger-700">At Risk</span> = past target date ·{' '}
        <span className="text-amber-700">Attention</span> = due within 7 days, has overdue tasks or critical risk ·{' '}
        <span className="text-success-700">Healthy</span> = on schedule.
      </p>
    </>
  )
}
