import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './core/components/Sidebar'
import EmptyPage from './core/components/EmptyPage'
import SettingsPage from './core/pages/SettingsPage'
import { coreWorkspaces, modules } from './core/nav'

export default function App(): JSX.Element {
  const genericPages = [...coreWorkspaces, ...modules].filter((page) => page.id !== 'settings')
  const settingsPage = coreWorkspaces.find((page) => page.id === 'settings')!

  return (
    <div className="flex h-screen w-screen bg-canvas text-text-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path={settingsPage.path} element={<SettingsPage />} />
          {genericPages.map((page) => (
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
