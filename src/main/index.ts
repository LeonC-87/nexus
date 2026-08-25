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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools({ mode: 'right' })
    }
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

    createWindow()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
