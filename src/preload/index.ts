import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { RoadmapItem, RoadmapItemInput } from '../shared/roadmap'

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
  }
}

try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('nexus', nexusAPI)
} catch (error) {
  console.error(error)
}

export type NexusAPI = typeof nexusAPI
