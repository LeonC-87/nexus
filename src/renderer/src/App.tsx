import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './core/components/Sidebar'
import EmptyPage from './core/components/EmptyPage'
import SettingsPage from './core/pages/SettingsPage'
import { coreWorkspaces, modules } from './core/nav'
import type { UpdateStatus } from '../../shared/update'
import type { Theme } from '../../shared/theme'
import { DEFAULT_THEME } from '../../shared/theme'

export default function App(): JSX.Element {
  const genericPages = [...coreWorkspaces, ...modules].filter((page) => page.id !== 'settings')
  const settingsPage = coreWorkspaces.find((page) => page.id === 'settings')!

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)

  useEffect(() => {
    window.nexus.update.check().then(setUpdateStatus)
    window.nexus.settings.getTheme().then((t) => {
      setThemeState(t)
      document.documentElement.dataset.theme = t
    })
  }, [])

  async function setTheme(next: Theme): Promise<void> {
    setThemeState(next)
    document.documentElement.dataset.theme = next
    await window.nexus.settings.setTheme(next)
  }

  return (
    <div className="flex h-screen w-screen bg-canvas text-text-primary">
      <Sidebar updateStatus={updateStatus} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route
            path={settingsPage.path}
            element={<SettingsPage updateStatus={updateStatus} theme={theme} onThemeChange={setTheme} />}
          />
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
