import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initDatabase } from './db'
import {
  listRoadmapItems,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem
} from './roadmap'
import { checkForUpdate, applyUpdate } from './update'
import { getTheme, setTheme } from './settings'
import {
  createSession,
  writeToSession,
  resizeSession,
  disposeSession,
  disposeAllSessions,
  popoutSession
} from './terminal'
import {
  initBrowserTabs,
  createTab,
  closeTab,
  closeAllTabs,
  switchTab,
  setActiveBounds,
  hideActiveTab,
  navigate,
  goBack,
  goForward,
  reload,
  listTabs,
  popoutTab
} from './browserTabs'
import type { BrowserBounds } from '../shared/browser'

let mainWindowRef: BrowserWindow | null = null

// Prevent duplicate instances - double-launching the app (e.g. via the
// desktop launcher while it's already running) focuses the existing
// window instead of opening a second one / risking a second SQLite writer.
const gotSingleInstanceLock = app.requestSingleInstanceLock()

if (!gotSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindowRef) {
      if (mainWindowRef.isMinimized()) mainWindowRef.restore()
      mainWindowRef.focus()
    }
  })
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a0d0c',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindowRef = mainWindow
  initBrowserTabs(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

if (gotSingleInstanceLock) {
  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.nexus.app')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    ipcMain.handle('nexus:get-app-version', () => app.getVersion())

    initDatabase()

    ipcMain.handle('nexus:roadmap:list', () => listRoadmapItems())
    ipcMain.handle('nexus:roadmap:create', (_event, input) => createRoadmapItem(input))
    ipcMain.handle('nexus:roadmap:update', (_event, id, input) => updateRoadmapItem(id, input))
    ipcMain.handle('nexus:roadmap:delete', (_event, id) => deleteRoadmapItem(id))

    ipcMain.handle('nexus:update:check', () => checkForUpdate())
    ipcMain.handle('nexus:update:apply', () => applyUpdate())

    ipcMain.handle('nexus:settings:get-theme', () => getTheme())
    ipcMain.handle('nexus:settings:set-theme', (_event, theme) => setTheme(theme))

    ipcMain.handle('nexus:terminal:create', (_event, cols: number, rows: number) =>
      createSession(cols, rows)
    )
    ipcMain.on('nexus:terminal:write', (_event, id: string, data: string) =>
      writeToSession(id, data)
    )
    ipcMain.on('nexus:terminal:resize', (_event, id: string, cols: number, rows: number) =>
      resizeSession(id, cols, rows)
    )
    ipcMain.on('nexus:terminal:dispose', (_event, id: string) => disposeSession(id))
    ipcMain.on('nexus:terminal:popout', (_event, id: string) => {
      if (mainWindowRef) popoutSession(id, mainWindowRef)
    })

    ipcMain.handle('nexus:browser:create-tab', (_event, url?: string) => createTab(url))
    ipcMain.handle('nexus:browser:close-tab', (_event, id: string) => closeTab(id))
    ipcMain.handle('nexus:browser:close-all', () => closeAllTabs())
    ipcMain.handle('nexus:browser:switch-tab', (_event, id: string, bounds: BrowserBounds) =>
      switchTab(id, bounds)
    )
    ipcMain.on('nexus:browser:set-bounds', (_event, bounds: BrowserBounds) =>
      setActiveBounds(bounds)
    )
    ipcMain.on('nexus:browser:hide', () => hideActiveTab())
    ipcMain.on('nexus:browser:navigate', (_event, id: string, url: string) => navigate(id, url))
    ipcMain.on('nexus:browser:go-back', (_event, id: string) => goBack(id))
    ipcMain.on('nexus:browser:go-forward', (_event, id: string) => goForward(id))
    ipcMain.on('nexus:browser:reload', (_event, id: string) => reload(id))
    ipcMain.handle('nexus:browser:list-tabs', () => listTabs())
    ipcMain.on('nexus:browser:open-external', (_event, url: string) => shell.openExternal(url))
    ipcMain.on('nexus:browser:popout', (_event, id: string) => popoutTab(id))

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  disposeAllSessions()
  closeAllTabs()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
