import { Briefcase } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { PageHeader } from '../components/ui'
import { CLIENT_STATUSES, SERVICE_TYPES } from '../lib/constants'
import type { Column } from '../lib/types'

const columns: Column[] = [
  { key: 'id', label: 'Client ID', computed: true },
  { key: 'company_name', label: 'Company Name', required: true, width: 'min-w-44' },
  { key: 'contact_person', label: 'Contact Person' },
  { key: 'phone', label: 'Phone', render: (r) => <span className="whitespace-nowrap">{r.phone ?? '—'}</span> },
  { key: 'email', label: 'Email', type: 'email', render: (r) => r.email ? <a href={`mailto:${r.email}`} className="text-brand hover:underline" onClick={(e) => e.stopPropagation()}>{r.email}</a> : '—' },
  { key: 'country', label: 'Country' },
  { key: 'service_type', label: 'Service Type', type: 'select', options: SERVICE_TYPES, filter: true },
  { key: 'project_name', label: 'Project Name', width: 'min-w-44' },
  { key: 'contract_value', label: 'Contract Value', type: 'currency', min: 0 },
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'end_date', label: 'End Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: CLIENT_STATUSES, required: true, filter: true },
  { key: 'project_manager', label: 'Project Manager', type: 'employee', filter: true },
  { key: 'notes', label: 'Notes', type: 'textarea', hideInTable: true },
]

export default function Clients() {
  return (
    <>
      <PageHeader icon={<Briefcase size={20} />} title="Client Management" subtitle="Every client, contract and account owner." />
      <DataTable readTable="clients" writeTable="clients" columns={columns} entity="Client" exportName="clients"
        defaults={{ status: 'Active', contract_value: 0 }} />
    </>
  )
}
