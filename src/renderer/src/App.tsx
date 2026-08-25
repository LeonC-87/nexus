import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './core/components/Sidebar'
import EmptyPage from './core/components/EmptyPage'
import { coreWorkspaces, modules } from './core/nav'

export default function App(): JSX.Element {
  const allPages = [...coreWorkspaces, ...modules]

  return (
    <div className="flex h-screen w-screen bg-canvas text-text-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          {allPages.map((page) => (
            <Route
              key={page.id}
              path={page.path}
              element={<EmptyPage title={page.label} description={page.description} />}
            />
          ))}
        </Routes>
      </main>
    </div>
  )
}
