import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { RoadmapItem, RoadmapItemInput } from '../shared/roadmap'
import type { UpdateStatus } from '../shared/update'
import type { Theme } from '../shared/theme'
import type { BrowserBounds, BrowserTabState } from '../shared/browser'

// Narrow, explicit bridge - the renderer never gets direct Node/filesystem/
// database access. Every capability it needs is exposed here deliberately.
const nexusAPI = {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('nexus:get-app-version'),
  roadmap: {
    list: (): Promise<RoadmapItem[]> => ipcRenderer.invoke('nexus:roadmap:list'),
    create: (input: RoadmapItemInput): Promise<RoadmapItem> =>
      ipcRenderer.invoke('nexus:roadmap:create', input),
    update: (id: number, input: Partial<RoadmapItemInput>): Promise<RoadmapItem> =>
      ipcRenderer.invoke('nexus:roadmap:update', id, input),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('nexus:roadmap:delete', id)
  },
  update: {
    check: (): Promise<UpdateStatus> => ipcRenderer.invoke('nexus:update:check'),
    apply: (): Promise<void> => ipcRenderer.invoke('nexus:update:apply')
  },
  settings: {
    getTheme: (): Promise<Theme> => ipcRenderer.invoke('nexus:settings:get-theme'),
    setTheme: (theme: Theme): Promise<Theme> => ipcRenderer.invoke('nexus:settings:set-theme', theme)
  },
  terminal: {
    create: (cols: number, rows: number): Promise<string> =>
      ipcRenderer.invoke('nexus:terminal:create', cols, rows),
    write: (id: string, data: string): void => {
      ipcRenderer.send('nexus:terminal:write', id, data)
    },
    resize: (id: string, cols: number, rows: number): void => {
      ipcRenderer.send('nexus:terminal:resize', id, cols, rows)
    },
    dispose: (id: string): void => {
      ipcRenderer.send('nexus:terminal:dispose', id)
    },
    onData: (callback: (id: string, data: string) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, id: string, data: string): void =>
        callback(id, data)
      ipcRenderer.on('nexus:terminal:data', listener)
      return () => ipcRenderer.removeListener('nexus:terminal:data', listener)
    },
    onExit: (callback: (id: string, exitCode: number) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, id: string, exitCode: number): void =>
        callback(id, exitCode)
      ipcRenderer.on('nexus:terminal:exit', listener)
      return () => ipcRenderer.removeListener('nexus:terminal:exit', listener)
    },
    popout: (id: string): void => {
      ipcRenderer.send('nexus:terminal:popout', id)
    },
    onPopoutClosed: (callback: (id: string) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, id: string): void => callback(id)
      ipcRenderer.on('nexus:terminal:popout-closed', listener)
      return () => ipcRenderer.removeListener('nexus:terminal:popout-closed', listener)
    }
  },
  browser: {
    createTab: (url?: string): Promise<string> => ipcRenderer.invoke('nexus:browser:create-tab', url),
    closeTab: (id: string): Promise<void> => ipcRenderer.invoke('nexus:browser:close-tab', id),
    closeAll: (): Promise<void> => ipcRenderer.invoke('nexus:browser:close-all'),
    switchTab: (id: string, bounds: BrowserBounds): Promise<void> =>
      ipcRenderer.invoke('nexus:browser:switch-tab', id, bounds),
    setBounds: (bounds: BrowserBounds): void => {
      ipcRenderer.send('nexus:browser:set-bounds', bounds)
    },
    hide: (): void => {
      ipcRenderer.send('nexus:browser:hide')
    },
    navigate: (id: string, url: string): void => {
      ipcRenderer.send('nexus:browser:navigate', id, url)
    },
    goBack: (id: string): void => {
      ipcRenderer.send('nexus:browser:go-back', id)
    },
    goForward: (id: string): void => {
      ipcRenderer.send('nexus:browser:go-forward', id)
    },
    reload: (id: string): void => {
      ipcRenderer.send('nexus:browser:reload', id)
    },
    listTabs: (): Promise<BrowserTabState[]> => ipcRenderer.invoke('nexus:browser:list-tabs'),
    onTabUpdated: (callback: (tab: BrowserTabState) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, tab: BrowserTabState): void =>
        callback(tab)
      ipcRenderer.on('nexus:browser:tab-updated', listener)
      return () => ipcRenderer.removeListener('nexus:browser:tab-updated', listener)
    },
    onTabClosed: (callback: (id: string) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, id: string): void => callback(id)
      ipcRenderer.on('nexus:browser:tab-closed', listener)
      return () => ipcRenderer.removeListener('nexus:browser:tab-closed', listener)
    },
    openExternal: (url: string): void => {
      ipcRenderer.send('nexus:browser:open-external', url)
    },
    popout: (id: string): void => {
      ipcRenderer.send('nexus:browser:popout', id)
    },
    onPopoutClosed: (callback: (id: string) => void): (() => void) => {
      const listener = (_event: Electron.IpcRendererEvent, id: string): void => callback(id)
      ipcRenderer.on('nexus:browser:popout-closed', listener)
      return () => ipcRenderer.removeListener('nexus:browser:popout-closed', listener)
    }
  }
}

try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('nexus', nexusAPI)
} catch (error) {
  console.error(error)
}

export type NexusAPI = typeof nexusAPI
