import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

export interface EmployeeRef { id: string; name: string; role_title: string | null; department: string | null }
export interface ProjectRef { id: string; name: string }
export interface ClientRef { id: string; company_name: string }

interface Lookups {
  employees: EmployeeRef[]
  projects: ProjectRef[]
  clients: ClientRef[]
  employeeName: (id: string | null | undefined) => string
  projectName: (id: string | null | undefined) => string
  clientName: (id: string | null | undefined) => string
  refresh: () => Promise<void>
}

const LookupsContext = createContext<Lookups | null>(null)

/**
 * Employee, project and client IDs are loaded once and shared, so anything added on one page
 * immediately appears in the dropdowns on every other page.
 */
export function LookupsProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<EmployeeRef[]>([])
  const [projects, setProjects] = useState<ProjectRef[]>([])
  const [clients, setClients] = useState<ClientRef[]>([])

  const refresh = useCallback(async () => {
    const [e, p, c] = await Promise.all([
      supabase.rpc('get_team_workload'),
      supabase.from('projects_dev').select('id, name').order('id'),
      supabase.rpc('get_client_directory'),
    ])
    setEmployees((e.data as EmployeeRef[] | null) ?? [])
    setProjects((p.data as ProjectRef[] | null) ?? [])
    setClients((c.data as ClientRef[] | null) ?? [])
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo<Lookups>(() => {
    const em = new Map(employees.map((x) => [x.id, x.name]))
    const pm = new Map(projects.map((x) => [x.id, x.name]))
    const cm = new Map(clients.map((x) => [x.id, x.company_name]))
    return {
      employees,
      projects,
      clients,
      employeeName: (id) => (id ? em.get(id) ?? id : ''),
      projectName: (id) => (id ? pm.get(id) ?? id : ''),
      clientName: (id) => (id ? cm.get(id) ?? id : ''),
      refresh,
    }
  }, [employees, projects, clients, refresh])

  return <LookupsContext.Provider value={value}>{children}</LookupsContext.Provider>
}

export function useLookups() {
  const ctx = useContext(LookupsContext)
  if (!ctx) throw new Error('useLookups must be used inside LookupsProvider')
  return ctx
}
