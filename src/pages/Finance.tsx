import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Landmark, Receipt, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DataTable } from '../components/DataTable'
import { Badge, PageHeader, StatCard } from '../components/ui'
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES, INVOICE_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../lib/constants'
import { fmtMoney, todayISO } from '../lib/format'
import type { Column, Row } from '../lib/types'

const invoiceCols: Column[] = [
  { key: 'id', label: 'Invoice #', computed: true },
  { key: 'client_id', label: 'Client', type: 'client', required: true, filter: true },
  { key: 'amount', label: 'Amount', type: 'currency', min: 0, required: true },
  { key: 'paid', label: 'Paid', type: 'currency', min: 0 },
  { key: 'balance', label: 'Balance', type: 'currency', computed: true },
  { key: 'payment_status', label: 'Payment Status', type: 'select', options: PAYMENT_STATUSES, computed: true, filter: true },
  { key: 'due_date', label: 'Due Date', type: 'date', required: true },
  { key: 'days_overdue', label: 'Days Overdue', computed: true, render: (r) => r.days_overdue > 0 ? <span className="font-semibold text-danger-700 tabular-nums">{r.days_overdue}d</span> : <span className="text-slate-300">—</span> },
  { key: 'issue_date', label: 'Issue Date', type: 'date', required: true },
  { key: 'project_id', label: 'Project', type: 'project', filter: true },
  { key: 'status', label: 'Status', type: 'select', options: INVOICE_STATUSES, required: true, filter: true, help: 'Draft / Sent / Cancelled. Payment status is calculated.' },
  { key: 'notes', label: 'Notes', type: 'textarea', hideInTable: true },
]

const expenseCols: Column[] = [
  { key: 'id', label: 'Expense ID', computed: true },
  { key: 'expense_date', label: 'Date', type: 'date', required: true },
  { key: 'description', label: 'Description', required: true, width: 'min-w-56', wide: true },
  { key: 'category', label: 'Category', type: 'select', options: EXPENSE_CATEGORIES, required: true, filter: true },
  { key: 'amount', label: 'Amount', type: 'currency', min: 0, required: true },
  { key: 'status', label: 'Status', type: 'select', options: EXPENSE_STATUSES, required: true, filter: true },
  { key: 'vendor', label: 'Vendor' },
  { key: 'project_id', label: 'Project', type: 'project', filter: true },
  { key: 'payment_method', label: 'Payment Method', type: 'select', options: PAYMENT_METHODS, required: true },
  { key: 'notes', label: 'Notes', type: 'textarea', hideInTable: true },
]

const sum = (rows: Row[], k: string) => rows.reduce((a, r) => a + Number(r[k] ?? 0), 0)

export default function Finance() {
  const [tab, setTab] = useState<'income' | 'expenses'>('income')
  const [inv, setInv] = useState<Row[]>([])
  const [exp, setExp] = useState<Row[]>([])

  const loadSummary = useCallback(async () => {
    const [a, b] = await Promise.all([supabase.from('invoices_v').select('*'), supabase.from('expenses').select('*')])
    setInv(a.data ?? [])
    setExp(b.data ?? [])
  }, [])
  useEffect(() => { loadSummary() }, [loadSummary])

  const live = inv.filter((r) => !['Cancelled', 'Draft'].includes(r.status))
  const invoiced = sum(live, 'amount')
  const received = sum(live, 'paid')
  const outstanding = sum(live, 'balance')
  const overdue = sum(live.filter((r) => r.payment_status === 'Overdue'), 'balance')
  const spent = sum(exp.filter((r) => r.status === 'Paid'), 'amount')
  const payable = sum(exp.filter((r) => r.status === 'Pending'), 'amount')
  const net = received - spent

  return (
    <>
      <PageHeader icon={<Receipt size={20} />} title="Invoices & Expenses" subtitle="Income, receivables and spend. Balances and payment status are calculated automatically." />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total invoiced" value={fmtMoney(invoiced)} icon={<Receipt size={16} />} tone="navy" />
        <StatCard label="Received" value={fmtMoney(received)} icon={<ArrowDownCircle size={16} />} tone="green" />
        <StatCard label="Outstanding" value={fmtMoney(outstanding)} icon={<Wallet size={16} />} tone="blue" />
        <StatCard label="Overdue" value={fmtMoney(overdue)} icon={<AlertCircle size={16} />} tone="red" />
        <StatCard label="Expenses paid" value={fmtMoney(spent)} icon={<ArrowUpCircle size={16} />} tone="orange" hint={payable ? `${fmtMoney(payable)} pending` : undefined} />
        <StatCard label="Net cash balance" value={fmtMoney(net)} icon={<Landmark size={16} />} tone={net >= 0 ? 'green' : 'red'} hint="Received − expenses paid" />
      </div>

      <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
        {(['income', 'expenses'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? 'bg-white text-navy shadow-xs' : 'text-slate-500 hover:text-navy'}`}>
            {t === 'income' ? 'Income (Invoices)' : 'Expenses'}
          </button>
        ))}
      </div>

      {tab === 'income' ? (
        <DataTable key="inv" readTable="invoices_v" writeTable="invoices" columns={invoiceCols} entity="Invoice" exportName="invoices"
          orderBy={{ column: 'issue_date', ascending: false }} onLoaded={loadSummary}
          defaults={{ issue_date: todayISO(), status: 'Sent', amount: 0, paid: 0 }} />
      ) : (
        <DataTable key="exp" readTable="expenses" writeTable="expenses" columns={expenseCols} entity="Expense" exportName="expenses"
          orderBy={{ column: 'expense_date', ascending: false }} onLoaded={loadSummary}
          defaults={{ expense_date: todayISO(), category: 'Other', payment_method: 'Bank Transfer', status: 'Paid', amount: 0 }} />
      )}
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <b>Payment status:</b> <Badge value="Paid" /> <Badge value="Partially Paid" /> <Badge value="Unpaid" /> <Badge value="Overdue" /> — Balance = Amount − Paid.
      </p>
    </>
  )
}
