const CURRENCY = (import.meta.env.VITE_CURRENCY as string | undefined) || 'USD'

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })
const moneyCompact = new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY, notation: 'compact', maximumFractionDigits: 1 })

export const fmtMoney = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : money.format(Number(v)))
export const fmtMoneyCompact = (v: number) => moneyCompact.format(v)

export function fmtDate(v: unknown): string {
  if (!v) return '—'
  const s = String(v)
  const d = s.length === 10 ? new Date(s + 'T00:00:00') : new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtDateTime(v: unknown): string {
  if (!v) return '—'
  const d = new Date(String(v))
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Local "today" as YYYY-MM-DD. */
export function todayISO(): string {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(toISO + 'T00:00:00') - Date.parse(fromISO + 'T00:00:00')) / 86400000)
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')
}

export function downloadCSV(filename: string, header: string[], rows: string[][]) {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
