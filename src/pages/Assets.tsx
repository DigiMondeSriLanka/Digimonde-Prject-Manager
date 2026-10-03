import { useCallback, useEffect, useState } from 'react'
import { History, Package, Undo2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLookups } from '../context/LookupsContext'
import { DataTable } from '../components/DataTable'
import { Avatar, Badge, Card, EmptyState, PageHeader } from '../components/ui'
import { ASSET_CATEGORIES, ASSET_CONDITIONS, ASSET_STATUSES, BILLING_CYCLES, WARRANTY_STATUSES } from '../lib/constants'
import { fmtDate, fmtDateTime } from '../lib/format'
import type { Column, Row } from '../lib/types'

const isSub = (r: Row) => r.category === 'Subscription'
const notSub = (r: Row) => !isSub(r)

const seatsCell = (r: Row) => {
  if (!isSub(r)) return <span className="text-slate-300">—</span>
  const over = r.seats != null && r.seats_used > r.seats
  return (
    <span className={`whitespace-nowrap tabular-nums ${over ? 'font-semibold text-danger-700' : ''}`} title={over ? 'More people than seats' : undefined}>
      {r.seats_used}{r.seats != null ? ` / ${r.seats}` : ''}
    </span>
  )
}

const columns: Column[] = [
  { key: 'id', label: 'Asset ID', computed: true },
  { key: 'name', label: 'Asset Name', required: true, width: 'min-w-48' },
  { key: 'category', label: 'Category', type: 'select', options: ASSET_CATEGORIES, required: true, filter: true,
    help: 'Choose “Subscription” for shared services (ChatGPT, Figma, Google Workspace…) assigned to several people.' },
  // Table: one "Assigned To" column for both physical assets and subscriptions
  { key: 'holders', label: 'Assigned To', type: 'employees', computed: true, filter: true, width: 'min-w-40' },
  { key: 'seats_used', label: 'Seats', computed: true, render: seatsCell },
  { key: 'assigned_since', label: 'Assigned Since', computed: true, render: (r) => <span className="whitespace-nowrap tabular-nums">{fmtDate(r.assigned_since)}</span> },
  // Form: physical asset → one person; subscription → many people
  { key: 'assigned_to', label: 'Employee Assigned', type: 'employee', hideInTable: true, showIf: notSub, help: 'Changing this records a handover in the assignment log.' },
  { key: 'assignees', label: 'Assigned To (users)', type: 'employees', hideInTable: true, showIf: isSub, help: 'Adding or removing a person is recorded in the assignment log with the date.' },
  { key: 'seats', label: 'Seats / Licences', type: 'number', min: 0, hideInTable: true, showIf: isSub },
  { key: 'billing_cycle', label: 'Billing Cycle', type: 'select', options: BILLING_CYCLES, hideInTable: true, showIf: isSub },
  { key: 'serial_number', label: 'Serial No.', showIf: notSub, render: (r) => <span className="font-mono text-xs text-slate-500">{r.serial_number ?? '—'}</span> },
  { key: 'purchase_date', label: 'Purchase / Start Date', type: 'date' },
  { key: 'purchase_cost', label: 'Cost', type: 'currency', min: 0, hideInTable: true, help: 'For subscriptions: cost per billing cycle.' },
  { key: 'expiry_date', label: 'Warranty / Renewal', type: 'date', computed: true },
  { key: 'warranty_until', label: 'Warranty Until', type: 'date', hideInTable: true, showIf: notSub },
  { key: 'renewal_date', label: 'Renewal Date', type: 'date', hideInTable: true, showIf: isSub },
  { key: 'warranty_status', label: 'Warranty / Renewal Status', type: 'select', options: WARRANTY_STATUSES, computed: true, filter: true },
  { key: 'condition', label: 'Condition', type: 'select', options: ASSET_CONDITIONS, required: true, showIf: notSub,
    render: (r) => isSub(r) ? <span className="text-slate-300">—</span> : <Badge value={r.condition} /> },
  { key: 'status', label: 'Status', type: 'select', options: ASSET_STATUSES, required: true, filter: true, help: 'Switches between Available / Assigned automatically.' },
  { key: 'notes', label: 'Notes', type: 'textarea', hideInTable: true },
]

function duration(from: string, to: string | null) {
  const days = Math.max(0, Math.round(((to ? Date.parse(to) : Date.now()) - Date.parse(from)) / 86400000))
  return days >= 60 ? `${Math.round(days / 30)} mo` : `${days} d`
}

function LogTable({ rows, showAsset }: { rows: Row[]; showAsset?: boolean }) {
  const { employeeName } = useLookups()
  if (!rows.length) return <EmptyState text="No assignments recorded yet." />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] tracking-wide text-slate-500 uppercase">
            {showAsset && <th className="px-3 py-2 font-semibold">Asset</th>}
            <th className="px-3 py-2 font-semibold">Employee</th>
            <th className="px-3 py-2 font-semibold">Assigned</th>
            <th className="px-3 py-2 font-semibold">Handed over</th>
            <th className="px-3 py-2 font-semibold">Duration</th>
            <th className="px-3 py-2 font-semibold">Condition out → in</th>
            <th className="px-3 py-2 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.id} className="border-t border-slate-100">
              {showAsset && <td className="px-3 py-2 whitespace-nowrap"><span className="font-mono text-xs text-brand">{l.asset_id}</span> {l.assets?.name}</td>}
              <td className="px-3 py-2">
                {l.employee_id ? <span className="flex items-center gap-2 whitespace-nowrap"><Avatar id={l.employee_id} name={employeeName(l.employee_id)} />{employeeName(l.employee_id)}</span> : '—'}
              </td>
              <td className="px-3 py-2 whitespace-nowrap tabular-nums">{fmtDateTime(l.assigned_at)}</td>
              <td className="px-3 py-2 whitespace-nowrap tabular-nums">{l.returned_at ? fmtDateTime(l.returned_at) : <Badge value="Current" tone="blue" />}</td>
              <td className="px-3 py-2 text-slate-600 tabular-nums">{duration(l.assigned_at, l.returned_at)}</td>
              <td className="px-3 py-2 whitespace-nowrap text-slate-600">{l.condition_assigned ?? '—'} → {l.condition_returned ?? '…'}</td>
              <td className="px-3 py-2 text-slate-500">{l.notes ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AssetHistory({ assetId }: { assetId: string }) {
  const [rows, setRows] = useState<Row[]>([])
  useEffect(() => {
    supabase.from('asset_assignments').select('*').eq('asset_id', assetId).order('assigned_at', { ascending: false })
      .then(({ data }) => setRows(data ?? []))
  }, [assetId])
  return (
    <div className="mt-6 border-t border-slate-100 pt-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-500 uppercase"><History size={13} /> Assignment & handover history</p>
      <LogTable rows={rows} />
    </div>
  )
}

export default function Assets() {
  const [tab, setTab] = useState<'assets' | 'log'>('assets')
  const [log, setLog] = useState<Row[]>([])
  const [token, setToken] = useState(0)

  const loadLog = useCallback(async () => {
    const { data } = await supabase.from('asset_assignments').select('*, assets(name)').order('assigned_at', { ascending: false })
    setLog(data ?? [])
  }, [])
  useEffect(() => { if (tab === 'log') loadLog() }, [tab, loadLog])

  const handOver = async (r: Row) => {
    if (!window.confirm(`Record handover of ${r.id} (${r.name}) back to the company?`)) return
    const { error } = await supabase.from('assets').update({ assigned_to: null }).eq('id', r.id)
    if (error) return window.alert(error.message)
    setToken((t) => t + 1)
  }

  return (
    <>
      <PageHeader icon={<Package size={20} />} title="Company Assets"
        subtitle="Equipment and subscription services. Every assignment and handover is logged automatically with its date." />
      <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
        {(['assets', 'log'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium ${tab === t ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-navy'}`}>
            {t === 'assets' ? 'Asset register' : 'Assignment log'}
          </button>
        ))}
      </div>
      {tab === 'assets' ? (
        <DataTable readTable="assets_v" writeTable="assets" columns={columns} entity="Asset" exportName="assets" reloadToken={token}
          defaults={{ category: 'Laptop', condition: 'New', status: 'Available', purchase_cost: 0, assignees: [] }}
          rowActions={(r) => r.assigned_to ? (
            <button title="Record handover (return to company)" onClick={() => handOver(r)} className="rounded-md p-1.5 text-slate-400 hover:bg-warning-50 hover:text-warning-700">
              <Undo2 size={14} />
            </button>
          ) : null}
          formExtra={(row) => row ? <AssetHistory assetId={row.id} /> : null} />
      ) : (
        <Card title="Assignment & handover log" subtitle={`${log.length} records`}>
          <LogTable rows={log} showAsset />
        </Card>
      )}
    </>
  )
}
