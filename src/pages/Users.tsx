import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useLookups } from '../context/LookupsContext'
import { RefSelect } from '../components/Fields'
import { Badge, Card, PageHeader, inputCls } from '../components/ui'
import { fmtDate } from '../lib/format'
import type { Row } from '../lib/types'

export default function Users() {
  const { profile: me } = useAuth()
  const { employees } = useLookups()
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at')
    if (error) setError(error.message)
    setRows(data ?? [])
  }, [])
  useEffect(() => { load() }, [load])

  const update = async (id: string, patch: Row) => {
    const { error } = await supabase.from('profiles').update(patch).eq('id', id)
    if (error) setError(error.message)
    else { setError(null); load() }
  }

  return (
    <>
      <PageHeader icon={<ShieldCheck size={20} />} title="Users & Access"
        subtitle="Admins can view and edit everything. Employees can view the Dashboard and Projects (Dev & DM), and add / edit Tasks." />
      {error && <div className="mb-4 rounded-lg bg-danger-50 p-3 text-sm text-danger-700">{error}</div>}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="px-3 py-2 font-semibold">User</th>
                <th className="px-3 py-2 font-semibold">Access level</th>
                <th className="px-3 py-2 font-semibold">Linked employee</th>
                <th className="px-3 py-2 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const self = u.id === me?.id
                return (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-3 py-3">
                      <p className="font-medium text-navy">{u.full_name ?? '—'} {self && <Badge value="You" tone="blue" />}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <select disabled={self} title={self ? 'You cannot change your own access level' : undefined}
                        value={u.role} onChange={(e) => update(u.id, { role: e.target.value })} className={`${inputCls} w-36`}>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                    <td className="w-72 px-3 py-3">
                      <RefSelect value={u.employee_id} onChange={(v) => update(u.id, { employee_id: v })} placeholder="Link to employee…"
                        options={employees.map((e) => ({ value: e.id, label: e.name, hint: e.role_title ?? undefined }))} />
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-500">{fmtDate(u.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="mt-3 text-xs text-slate-500">New people sign up from the login page and start as <b>Employee</b>. Promote them here.</p>
    </>
  )
}
