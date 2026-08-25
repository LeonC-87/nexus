import { ElectronAPI } from '@electron-toolkit/preload'
import type { NexusAPI } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    nexus: NexusAPI
  }
}
