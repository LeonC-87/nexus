import { app } from 'electron'
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
// The version check shells out to the already-authenticated `gh` CLI rather
// than extracting/embedding its stored token - Nexus never touches the
// credential itself. This ties the check to gh being installed and signed
// in, which is fine for Leon's own machines right now but is exactly the
// kind of "assumes this is Leon's installation" shortcut that must NOT
// survive into a real distributable version - see docs/NAV_STRUCTURE.md.

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
  const { stdout } = await execAsync(
    'gh api repos/LeonC-87/nexus/contents/package.json --jq .content'
  )
  const decoded = Buffer.from(stdout.trim(), 'base64').toString('utf-8')
  const pkg = JSON.parse(decoded) as { version: string }
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
