import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Narrow, explicit bridge - the renderer never gets direct Node/filesystem/
// database access. Every capability it needs is exposed here deliberately.
const nexusAPI = {
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('nexus:get-app-version')
}

try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('nexus', nexusAPI)
} catch (error) {
  console.error(error)
}

export type NexusAPI = typeof nexusAPI
