export interface UpdateStatus {
  currentVersion: string
  latestVersion: string | null
  // Commit-based comparison, not just semver - a push without a version bump
  // (e.g. from the laptop) still needs to register as an update. See
  // src/main/update.ts.
  currentCommit: string | null
  latestCommit: string | null
  updateAvailable: boolean
  checked: boolean
  error?: string
}
