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
// Comparison is commit-based, not just semver. A push that doesn't bump
// package.json's version (e.g. from a second machine, easy to forget) must
// still register as an available update - comparing versions alone missed
// this in practice (laptop pushed a real change, PC still said "up to
// date" because the version number hadn't changed).
//
// Both requests are plain unauthenticated HTTPS - work for ANY user on ANY
// machine, no credentials, no gh CLI, no tie to Leon's own GitHub login.
// Only works because LeonC-87/nexus is public (made public 2026-08-25
// specifically for this).

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

async function getLocalCommit(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git rev-parse HEAD', { cwd: app.getAppPath() })
    return stdout.trim()
  } catch {
    // Not a git checkout (e.g. a packaged build) - commit comparison can't apply.
    return null
  }
}

// Uses GitHub's compare API rather than just "is the SHA different", because a
// different SHA doesn't necessarily mean remote is AHEAD - it could mean local
// has unpushed commits (very normal on Leon's own dev machines). ahead_by is
// specifically "how many commits does main have that the local commit doesn't".
async function getRemoteAheadInfo(
  localCommit: string
): Promise<{ latestCommit: string; aheadBy: number }> {
  const response = await net.fetch(
    `https://api.github.com/repos/LeonC-87/nexus/compare/${localCommit}...main`,
    { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } }
  )
  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} ${response.statusText}`)
  }
  const data = (await response.json()) as { ahead_by: number; commits: { sha: string }[] }
  return {
    latestCommit: data.commits.at(-1)?.sha ?? localCommit,
    aheadBy: data.ahead_by
  }
}

export async function checkForUpdate(): Promise<UpdateStatus> {
  const currentVersion = app.getVersion()
  try {
    const currentCommit = await getLocalCommit()

    if (currentCommit === null) {
      // No local git checkout to compare against (e.g. a packaged build) -
      // fall back to version-only comparison.
      const latestVersion = await getRemoteVersion()
      return {
        currentVersion,
        latestVersion,
        currentCommit: null,
        latestCommit: null,
        updateAvailable: compareVersions(latestVersion, currentVersion) > 0,
        checked: true
      }
    }

    const [latestVersion, { latestCommit, aheadBy }] = await Promise.all([
      getRemoteVersion(),
      getRemoteAheadInfo(currentCommit)
    ])

    return {
      currentVersion,
      latestVersion,
      currentCommit,
      latestCommit,
      updateAvailable: aheadBy > 0,
      checked: true
    }
  } catch (error) {
    return {
      currentVersion,
      latestVersion: null,
      currentCommit: null,
      latestCommit: null,
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
