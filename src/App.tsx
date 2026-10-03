import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LookupsProvider } from './context/LookupsContext'
import { isConfigured } from './lib/supabase'
import { Layout } from './components/Layout'
import { Spinner } from './components/ui'
import Login from './pages/Login'
import SetupNotice from './pages/SetupNotice'
import Dashboard from './pages/Dashboard'
import ProjectsDev from './pages/ProjectsDev'
import ProjectsDM from './pages/ProjectsDM'
import Tasks from './pages/Tasks'
import Meetings from './pages/Meetings'
import Team from './pages/Team'
import Clients from './pages/Clients'
import Finance from './pages/Finance'
import Risks from './pages/Risks'
import Assets from './pages/Assets'
import Users from './pages/Users'

function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />
}

function Gate() {
  const { session, loading } = useAuth()
  if (loading) return <div className="grid h-full place-items-center"><Spinner /></div>
  if (!session) return <Login />
  return (
    <LookupsProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectsDev />} />
          <Route path="dm" element={<ProjectsDM />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="meetings" element={<AdminOnly><Meetings /></AdminOnly>} />
          <Route path="team" element={<AdminOnly><Team /></AdminOnly>} />
          <Route path="clients" element={<AdminOnly><Clients /></AdminOnly>} />
          <Route path="finance" element={<AdminOnly><Finance /></AdminOnly>} />
          <Route path="risks" element={<AdminOnly><Risks /></AdminOnly>} />
          <Route path="assets" element={<AdminOnly><Assets /></AdminOnly>} />
          <Route path="users" element={<AdminOnly><Users /></AdminOnly>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </LookupsProvider>
  )
}

export default function App() {
  if (!isConfigured) return <SetupNotice />
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
