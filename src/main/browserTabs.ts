import { BrowserWindow, WebContentsView, session } from 'electron'
import type { BrowserBounds, BrowserTabState } from '../shared/browser'
import { createPopoutWindow } from './popout'

// A real embedded Chromium surface (WebContentsView, attached to the main
// BrowserWindow) - not an iframe/<webview>. Google and most identity
// providers block sign-in inside <webview>/iframes; a WebContentsView is
// architecturally a real browser surface (same approach Slack/Postman use),
// so Google login works and persists via a dedicated session partition.
const PARTITION = 'persist:nexus-browser'
const DEFAULT_URL = 'https://www.google.com'

let mainWindow: BrowserWindow | null = null
let activeTabId: string | null = null
let nextId = 1

const tabs = new Map<string, WebContentsView>()
const popouts = new Map<string, BrowserWindow>()

function toState(id: string, view: WebContentsView): BrowserTabState {
  const wc = view.webContents
  return {
    id,
    title: wc.getTitle() || wc.getURL() || 'New Tab',
    url: wc.getURL(),
    isLoading: wc.isLoading(),
    canGoBack: wc.navigationHistory.canGoBack(),
    canGoForward: wc.navigationHistory.canGoForward()
  }
}

function sendTabUpdate(id: string): void {
  const view = tabs.get(id)
  if (!view || !mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('nexus:browser:tab-updated', toState(id, view))
}

function sendTabClosed(id: string): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('nexus:browser:tab-closed', id)
}

export function initBrowserTabs(window: BrowserWindow): void {
  mainWindow = window
  window.on('closed', () => {
    mainWindow = null
  })
}

export function createTab(url: string = DEFAULT_URL): string {
  if (!mainWindow) throw new Error('Browser not initialised')
  const id = String(nextId++)

  const view = new WebContentsView({
    webPreferences: {
      partition: PARTITION,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const wc = view.webContents
  wc.on('page-title-updated', () => sendTabUpdate(id))
  wc.on('did-navigate', () => sendTabUpdate(id))
  wc.on('did-navigate-in-page', () => sendTabUpdate(id))
  wc.on('did-start-loading', () => sendTabUpdate(id))
  wc.on('did-stop-loading', () => sendTabUpdate(id))

  // "New tab window" links (target=_blank, window.open, OAuth popups) open as
  // a new tab in this same panel rather than an uncontrolled native window.
  wc.setWindowOpenHandler(({ url: openUrl }) => {
    createTab(openUrl)
    return { action: 'deny' }
  })

  tabs.set(id, view)
  wc.loadURL(url)
  return id
}

export function closeTab(id: string): void {
  const view = tabs.get(id)
  if (!view) return
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.contentView.removeChildView(view)
  }
  const popout = popouts.get(id)
  if (popout && !popout.isDestroyed()) popout.close()
  popouts.delete(id)
  view.webContents.close()
  tabs.delete(id)
  if (activeTabId === id) activeTabId = null
  sendTabClosed(id)
}

export function closeAllTabs(): void {
  for (const id of Array.from(tabs.keys())) {
    closeTab(id)
  }
}

export function switchTab(id: string, bounds: BrowserBounds): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  const nextView = tabs.get(id)
  if (!nextView) return

  if (activeTabId && activeTabId !== id) {
    const prevView = tabs.get(activeTabId)
    if (prevView) mainWindow.contentView.removeChildView(prevView)
  }

  if (!mainWindow.contentView.children.includes(nextView)) {
    mainWindow.contentView.addChildView(nextView)
  }
  nextView.setBounds({
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height)
  })
  activeTabId = id
}

export function setActiveBounds(bounds: BrowserBounds): void {
  if (!activeTabId) return
  const view = tabs.get(activeTabId)
  if (!view) return
  view.setBounds({
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height)
  })
}

export function popoutTab(id: string): void {
  const view = tabs.get(id)
  if (!view || !mainWindow || mainWindow.isDestroyed()) return
  const existing = popouts.get(id)
  if (existing && !existing.isDestroyed()) {
    existing.focus()
    return
  }

  mainWindow.contentView.removeChildView(view)
  if (activeTabId === id) activeTabId = null

  const popout = createPopoutWindow(mainWindow, `/popout/browser/${id}`, view.webContents.getTitle() || 'Nexus Browser')
  popout.contentView.addChildView(view)
  const fit = (): void => {
    const [width, height] = popout.getContentSize()
    view.setBounds({ x: 0, y: 0, width, height })
  }
  fit()
  popout.on('resize', fit)
  popout.on('closed', () => {
    popouts.delete(id)
    // Detach (don't destroy) so the tab can be reattached to the main
    // panel instead of losing the page/session - "doesn't refresh it".
    if (tabs.has(id)) {
      mainWindow?.webContents.send('nexus:browser:popout-closed', id)
    }
  })
  popouts.set(id, popout)
}

export function hideActiveTab(): void {
  if (!mainWindow || mainWindow.isDestroyed() || !activeTabId) return
  const view = tabs.get(activeTabId)
  if (view) mainWindow.contentView.removeChildView(view)
  activeTabId = null
}

export function navigate(id: string, url: string): void {
  const view = tabs.get(id)
  if (!view) return
  const target = /^[a-z]+:\/\//i.test(url) ? url : `https://${url}`
  view.webContents.loadURL(target).catch(() => {
    // Not a URL - treat as a search query.
    view.webContents.loadURL(`https://www.google.com/search?q=${encodeURIComponent(url)}`)
  })
}

export function goBack(id: string): void {
  const view = tabs.get(id)
  if (view?.webContents.navigationHistory.canGoBack()) view.webContents.navigationHistory.goBack()
}

export function goForward(id: string): void {
  const view = tabs.get(id)
  if (view?.webContents.navigationHistory.canGoForward()) {
    view.webContents.navigationHistory.goForward()
  }
}

export function reload(id: string): void {
  tabs.get(id)?.webContents.reload()
}

export function listTabs(): BrowserTabState[] {
  return Array.from(tabs.entries()).map(([id, view]) => toState(id, view))
}

export function clearBrowserData(): Promise<void> {
  return session.fromPartition(PARTITION).clearStorageData()
}
