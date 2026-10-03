import { Megaphone } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { PageHeader } from '../components/ui'
import { DM_STATUSES, PRIORITIES, RISK_LEVELS } from '../lib/constants'
import type { Column } from '../lib/types'

const columns: Column[] = [
  { key: 'id', label: 'Project ID', computed: true },
  { key: 'name', label: 'Project Name', required: true, width: 'min-w-64' },
  { key: 'description', label: 'Description', type: 'textarea', hideInTable: true },
  { key: 'client_id', label: 'Client', type: 'client', filter: true },
  { key: 'owner_id', label: 'Project Owner', type: 'employee' },
  { key: 'manager_id', label: 'Project Manager', type: 'employee', filter: true },
  { key: 'handler_id', label: 'Project Handler', type: 'employee', filter: true },
  { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, required: true, filter: true },
  { key: 'status', label: 'Status', type: 'select', options: DM_STATUSES, required: true, filter: true },
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'reporting_month', label: 'Reporting Month', type: 'date', hideInTable: true, help: 'First day of the month the post counts refer to.' },
  { key: 'posts_per_month', label: 'Posts / Month', type: 'number', min: 0 },
  { key: 'published_posts', label: 'Published', type: 'number', min: 0 },
  { key: 'remaining_posts', label: 'Remaining', type: 'number', computed: true },
  { key: 'completion_pct', label: 'Completion', type: 'percent', computed: true },
  { key: 'total_tasks', label: 'Tasks', type: 'number', computed: true },
  { key: 'open_tasks', label: 'Open Tasks', type: 'number', computed: true },
  { key: 'overdue_tasks', label: 'Overdue', type: 'number', computed: true, hideInTable: true },
  { key: 'risk_level', label: 'Risk Level', type: 'select', options: RISK_LEVELS, required: true },
  { key: 'notes', label: 'Notes', type: 'textarea', hideInTable: true },
]

export default function ProjectsDM() {
  return (
    <>
      <PageHeader
        icon={<Megaphone size={20} />}
        title="Project Master Database — DM"
        subtitle="Digital marketing retainers and campaigns (Active / Inactive). Completion % = published posts ÷ posts per month."
      />
      <DataTable
        readTable="projects_dm_v"
        writeTable="projects_dm"
        columns={columns}
        entity="DM Project"
        exportName="projects-dm"
        defaults={{ priority: 'Medium', status: 'Active', risk_level: 'Low', posts_per_month: 0, published_posts: 0 }}
      />
    </>
  )
}
