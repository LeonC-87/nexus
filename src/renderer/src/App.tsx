import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './core/components/Sidebar'
import SidePanel from './core/components/SidePanel'
import EmptyPage from './core/components/EmptyPage'
import SettingsPage from './core/pages/SettingsPage'
import PopoutTerminalPage from './core/pages/PopoutTerminalPage'
import PopoutBrowserPage from './core/pages/PopoutBrowserPage'
import { coreWorkspaces, modules } from './core/nav'
import { useResizableWidth } from './core/hooks/useResizableWidth'
import { useLocalStorageState } from './core/hooks/useLocalStorageState'
import type { UpdateStatus } from '../../shared/update'
import type { Theme } from '../../shared/theme'
import { DEFAULT_THEME } from '../../shared/theme'

function MainApp(): JSX.Element {
  const genericPages = [...coreWorkspaces, ...modules].filter((page) => page.id !== 'settings')
  const settingsPage = coreWorkspaces.find((page) => page.id === 'settings')!

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)

  const sidebar = useResizableWidth('nexus.sidebarWidth', 240, 180, 420)
  const sidePanel = useResizableWidth('nexus.sidePanelWidth', 420, 280, 800)
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorageState('nexus.sidebarCollapsed', false)
  const [sidePanelCollapsed, setSidePanelCollapsed] = useLocalStorageState(
    'nexus.sidePanelCollapsed',
    false
  )

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
      <Sidebar
        updateStatus={updateStatus}
        width={sidebar.width}
        onResizeStart={sidebar.onDragStart}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="min-w-0 flex-1 overflow-y-auto">
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
      <SidePanel
        width={sidePanel.width}
        onResizeStart={sidePanel.onDragStart}
        collapsed={sidePanelCollapsed}
        onToggleCollapsed={() => setSidePanelCollapsed(!sidePanelCollapsed)}
      />
    </div>
  )
}

export default function App(): JSX.Element {
  const location = useLocation()

  // Popout windows load this same bundle at a dedicated hash route - full
  // window, no sidebar/chrome, see main/popout.ts.
  if (location.pathname.startsWith('/popout/')) {
    return (
      <Routes>
        <Route path="/popout/terminal/:sessionId" element={<PopoutTerminalPage />} />
        <Route path="/popout/browser/:tabId" element={<PopoutBrowserPage />} />
      </Routes>
    )
  }

  return <MainApp />
}
