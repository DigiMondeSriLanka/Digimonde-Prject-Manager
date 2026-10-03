import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { DataTable } from '../components/DataTable'
import { Card, PageHeader } from '../components/ui'
import { RISK_CATEGORIES, RISK_STATUSES, SEVERITY_LEVELS } from '../lib/constants'
import type { Column, Row } from '../lib/types'

const scoreCell = (r: Row) => {
  const s = Number(r.severity_score)
  const cls = s >= 13 ? 'bg-danger text-white' : s >= 6 ? 'bg-amber-400 text-navy' : 'bg-success text-white'
  return <span className={`inline-grid size-7 place-items-center rounded-md text-xs font-bold tabular-nums ${cls}`}>{s}</span>
}

const columns: Column[] = [
  { key: 'id', label: 'Risk ID', computed: true },
  { key: 'project_id', label: 'Project', type: 'project', filter: true },
  { key: 'description', label: 'Risk Description', type: 'textarea', required: true },
  { key: 'category', label: 'Category', type: 'select', options: RISK_CATEGORIES, required: true, filter: true },
  { key: 'probability', label: 'Probability (1–5)', type: 'number', min: 1, max: 5, required: true },
  { key: 'impact', label: 'Impact (1–5)', type: 'number', min: 1, max: 5, required: true },
  { key: 'severity_score', label: 'Score', computed: true, render: scoreCell },
  { key: 'severity_level', label: 'Severity', type: 'select', options: SEVERITY_LEVELS, computed: true, filter: true },
  { key: 'owner_id', label: 'Owner', type: 'employee', filter: true },
  { key: 'mitigation', label: 'Mitigation Plan', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: RISK_STATUSES, required: true, filter: true },
  { key: 'target_date', label: 'Target Resolution', type: 'date' },
]

/** 5×5 probability × impact heat map of open risks. */
function RiskMatrix({ rows }: { rows: Row[] }) {
  const open = rows.filter((r) => !['Closed', 'Mitigated'].includes(r.status))
  const cell = (p: number, i: number) => open.filter((r) => r.probability === p && r.impact === i)
  const bg = (s: number) => (s >= 13 ? 'bg-danger-50 ring-danger/30' : s >= 6 ? 'bg-amber-50 ring-amber-400/40' : 'bg-success-50 ring-success/25')
  return (
    <Card title="Risk heat map" subtitle="Open risks by probability × impact">
      <div className="flex gap-2">
        <div className="flex w-4 items-center"><span className="-rotate-90 text-[10px] font-medium whitespace-nowrap text-slate-500">PROBABILITY</span></div>
        <div className="flex-1">
          <div className="grid grid-cols-[16px_repeat(5,1fr)] gap-1">
            {[5, 4, 3, 2, 1].map((p) => (
              <div key={p} className="contents">
                <span className="grid place-items-center text-[10px] text-slate-400">{p}</span>
                {[1, 2, 3, 4, 5].map((i) => {
                  const items = cell(p, i)
                  return (
                    <div key={i} title={items.map((r) => `${r.id}: ${r.description}`).join('\n')}
                      className={`grid aspect-[5/3] place-items-center rounded-md text-xs font-semibold ring-1 ring-inset ${bg(p * i)}`}>
                      {items.length || ''}
                    </div>
                  )
                })}
              </div>
            ))}
            <span />
            {[1, 2, 3, 4, 5].map((i) => <span key={i} className="text-center text-[10px] text-slate-400">{i}</span>)}
          </div>
          <p className="mt-1 text-center text-[10px] font-medium text-slate-500">IMPACT</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-600">
        <span className="flex items-center gap-1"><i className="size-2.5 rounded-sm bg-success" /> 1–5 Low</span>
        <span className="flex items-center gap-1"><i className="size-2.5 rounded-sm bg-amber-400" /> 6–12 Medium</span>
        <span className="flex items-center gap-1"><i className="size-2.5 rounded-sm bg-danger" /> 13–25 Critical</span>
      </div>
    </Card>
  )
}

export default function Risks() {
  const [rows, setRows] = useState<Row[]>([])
  return (
    <>
      <PageHeader icon={<AlertTriangle size={20} />} title="Risks & Issues Register" subtitle="Risk score = probability × impact." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <DataTable readTable="risks" writeTable="risks" columns={columns} entity="Risk" exportName="risks"
            orderBy={{ column: 'severity_score', ascending: false }} onLoaded={setRows}
            defaults={{ category: 'Technical', probability: 3, impact: 3, status: 'Open' }} />
        </div>
        <div><RiskMatrix rows={rows} /></div>
      </div>
    </>
  )
}
