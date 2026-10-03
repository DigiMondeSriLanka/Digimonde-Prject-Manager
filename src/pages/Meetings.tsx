import { CalendarCheck } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { PageHeader } from '../components/ui'
import { MEETING_STATUSES, MEETING_TYPES } from '../lib/constants'
import { fmtDate, todayISO } from '../lib/format'
import type { Column } from '../lib/types'

const columns: Column[] = [
  { key: 'id', label: 'Meeting ID', computed: true },
  { key: 'meeting_date', label: 'Date', type: 'date', required: true },
  { key: 'meeting_type', label: 'Meeting Type', type: 'select', options: MEETING_TYPES, required: true, filter: true },
  { key: 'participants', label: 'Participants', type: 'employees', filter: true, width: 'min-w-36' },
  { key: 'topic', label: 'Discussion Topic', required: true, width: 'min-w-48', wide: true },
  { key: 'decision', label: 'Decision Made', type: 'textarea' },
  { key: 'action_item', label: 'Action Item', type: 'textarea' },
  { key: 'owner_id', label: 'Owner', type: 'employee', filter: true },
  {
    key: 'deadline', label: 'Deadline', type: 'date',
    render: (r) => {
      const late = r.deadline && r.deadline < todayISO() && !['Completed', 'Cancelled'].includes(r.status)
      return <span className={`whitespace-nowrap tabular-nums ${late ? 'font-semibold text-danger-700' : ''}`}>{fmtDate(r.deadline)}{late && ' · overdue'}</span>
    },
  },
  { key: 'status', label: 'Status', type: 'select', options: MEETING_STATUSES, required: true, filter: true },
]

export default function Meetings() {
  return (
    <>
      <PageHeader icon={<CalendarCheck size={20} />} title="Meeting & Action Tracker" subtitle="Decisions and follow-up actions from every meeting." />
      <DataTable readTable="meetings" writeTable="meetings" columns={columns} entity="Meeting" exportName="meetings"
        orderBy={{ column: 'meeting_date', ascending: false }}
        defaults={{ meeting_date: todayISO(), meeting_type: 'Management', status: 'Open', participants: [] }} />
    </>
  )
}
