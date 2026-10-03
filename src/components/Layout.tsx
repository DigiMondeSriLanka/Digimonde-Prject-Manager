import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  AlertTriangle, Briefcase, CalendarCheck, FolderKanban, LayoutDashboard, ListChecks, LogOut, Megaphone,
  Menu, Package, Receipt, ShieldCheck, Users as UsersIcon, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ui'

const NAV = [
  { group: 'Overview', items: [{ to: '/', label: 'Executive Dashboard', icon: LayoutDashboard }] },
  {
    group: 'Delivery',
    items: [
      { to: '/projects', label: 'Projects — Dev', icon: FolderKanban },
      { to: '/dm', label: 'Projects — DM', icon: Megaphone },
      { to: '/tasks', label: 'Tasks', icon: ListChecks },
    ],
  },
  {
    group: 'Operations',
    admin: true,
    items: [
      { to: '/meetings', label: 'Meetings & Actions', icon: CalendarCheck },
      { to: '/team', label: 'Team Resources', icon: UsersIcon },
      { to: '/assets', label: 'Company Assets', icon: Package },
    ],
  },
  {
    group: 'Business',
    admin: true,
    items: [
      { to: '/clients', label: 'Clients', icon: Briefcase },
      { to: '/finance', label: 'Invoices & Expenses', icon: Receipt },
      { to: '/risks', label: 'Risks & Issues', icon: AlertTriangle },
    ],
  },
  { group: 'Admin', admin: true, items: [{ to: '/users', label: 'Users & Access', icon: ShieldCheck }] },
]

export function Layout() {
  const { profile, isAdmin, signOut, session } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const name = profile?.full_name || session?.user.email || 'User'

  const sidebar = (
    <nav className="flex h-full flex-col bg-navy text-slate-300">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <img src="/favicon.svg" alt="" className="size-8 rounded-lg ring-1 ring-white/10" />
        <div>
          <p className="text-[15px] font-bold tracking-tight text-white">Digimonde</p>
          <p className="text-[11px] text-slate-400">Project Management</p>
        </div>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
        {NAV.filter((g) => !g.admin || isAdmin).map((g) => (
          <div key={g.group}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">{g.group}</p>
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-brand text-white shadow-sm shadow-brand/30' : 'hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <it.icon size={17} strokeWidth={1.9} />
                {it.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar id={profile?.employee_id ?? '0'} name={name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="text-[11px] text-slate-400">{isAdmin ? 'Admin · full access' : 'Employee · view only'}</p>
          </div>
          <button onClick={signOut} title="Sign out" className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )

  return (
    <div className="flex h-full">
      <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-1.5 text-navy hover:bg-slate-100" aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-bold text-navy">Digimonde</span>
        </header>
        <main key={pathname} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            {!isAdmin && (
              <div className="mb-4 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-xs text-brand-700">
                You have <b>view-only</b> access. Ask an admin if you need to update records.
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
