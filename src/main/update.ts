import { app, net } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'
import type { UpdateStatus } from '../shared/update'

const execAsync = promisify(exec)

// Placeholder update mechanism for the current dev-mode/source-clone stage of
// Nexus - not the real distributable updater described in the Nexus Product
// Discovery (that needs electron-builder/NSIS/electron-updater against real
// releases, once Nexus is actually packaged for other users). For now, while
// Nexus only exists as a git-cloned dev checkout, "update" genuinely means:
// pull latest source, reinstall deps, relaunch.
//
// The version check is a plain unauthenticated request to raw.githubusercontent.com
// - works for ANY user on ANY machine with no credentials, no gh CLI, no tie to
// Leon's own GitHub login. This only works because LeonC-87/nexus is public
// (made public 2026-08-25 specifically so this could work for other users, e.g.
// Leon's partner running her own independent copy - see README.md "Scope note").

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] ?? 0
    const nb = pb[i] ?? 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

async function getRemoteVersion(): Promise<string> {
  const response = await net.fetch(
    'https://raw.githubusercontent.com/LeonC-87/nexus/main/package.json',
    { cache: 'no-store' }
  )
  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} ${response.statusText}`)
  }
  const pkg = (await response.json()) as { version: string }
  return pkg.version
}

export async function checkForUpdate(): Promise<UpdateStatus> {
  const currentVersion = app.getVersion()
  try {
    const latestVersion = await getRemoteVersion()
    return {
      currentVersion,
      latestVersion,
      updateAvailable: compareVersions(latestVersion, currentVersion) > 0,
      checked: true
    }
  } catch (error) {
    return {
      currentVersion,
      latestVersion: null,
      updateAvailable: false,
      checked: true,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export async function applyUpdate(): Promise<void> {
  const appRoot = app.getAppPath()
  await execAsync('git pull', { cwd: appRoot })
  await execAsync('npm install', { cwd: appRoot })
  app.relaunch()
  app.exit(0)
}
