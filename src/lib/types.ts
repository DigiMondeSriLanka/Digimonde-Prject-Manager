import type { ReactNode } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any>

export type FieldType =
  | 'text' | 'textarea' | 'email' | 'number' | 'currency' | 'percent' | 'date'
  | 'select' | 'employee' | 'employees' | 'project' | 'client' | 'tags'

export interface Column {
  key: string
  label: string
  type?: FieldType
  options?: readonly string[]
  required?: boolean
  /** Calculated by the database — shown, never edited. */
  computed?: boolean
  hideInTable?: boolean
  hideInForm?: boolean
  /** Show as a slicer above the table. */
  filter?: boolean
  render?: (row: Row) => ReactNode
  min?: number
  max?: number
  step?: number
  /** Span both form columns. */
  wide?: boolean
  help?: string
  /** Tailwind min-width class for the table cell. */
  width?: string
}
