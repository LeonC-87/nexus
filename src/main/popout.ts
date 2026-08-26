import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

// A popout window loads the same renderer bundle at a dedicated hash route
// (see App.tsx's /popout/* routes) which renders just that one surface full
// window, no sidebar/chrome - sized close to the main window per the
// "nearly full nexus window" request.
export function createPopoutWindow(
  mainWindow: BrowserWindow,
  hashRoute: string,
  title: string
): BrowserWindow {
  const bounds = mainWindow.getBounds()
  const margin = 60
  const popout = new BrowserWindow({
    width: Math.max(700, bounds.width - margin),
    height: Math.max(500, bounds.height - margin),
    x: bounds.x + Math.round(margin / 2),
    y: bounds.y + Math.round(margin / 2),
    title,
    autoHideMenuBar: true,
    backgroundColor: '#0a0d0c',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    popout.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${hashRoute}`)
  } else {
    popout.loadFile(join(__dirname, '../renderer/index.html'), { hash: hashRoute })
  }

  return popout
}
