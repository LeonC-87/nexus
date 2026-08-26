import { useState } from 'react'
import RoadmapView from '../components/RoadmapView'
import { coreWorkspaces } from '../nav'
import type { UpdateStatus } from '../../../../shared/update'
import type { Theme } from '../../../../shared/theme'

const settingsDescription = coreWorkspaces.find((w) => w.id === 'settings')!.description

type SettingsTab = 'general' | 'roadmap'

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'roadmap', label: 'Roadmap' }
]

export default function SettingsPage({
  updateStatus,
  theme,
  onThemeChange
}: {
  updateStatus: UpdateStatus | null
  theme: Theme
  onThemeChange: (theme: Theme) => void
}): JSX.Element {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [updating, setUpdating] = useState(false)

  async function handleUpdate(): Promise<void> {
    setUpdating(true)
    try {
      await window.nexus.update.apply()
      // App relaunches itself on success - if we're still here, it failed.
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-nexusBorder px-8 py-6">
        <h1 className="mb-4 text-xl font-semibold text-text-primary">Settings</h1>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'rounded-nsm px-3 py-1.5 text-sm transition-colors duration-fast',
                activeTab === tab.id
                  ? 'bg-surface3 text-text-primary shadow-glowSoft'
                  : 'text-text-secondary hover:bg-surface2 hover:text-text-primary'
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'general' ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8">
            <div className="flex w-full max-w-md items-center justify-between rounded-nlg border border-nexusBorder bg-surface1 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-text-primary">Appearance</p>
                <p className="text-xs text-text-muted">Light or dark canvas for the whole app</p>
              </div>
              <div className="flex gap-1 rounded-nsm border border-nexusBorder bg-surface2 p-1">
                {(['dark', 'light'] as Theme[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => onThemeChange(option)}
                    className={[
                      'rounded-nsm px-3 py-1 text-sm capitalize transition-colors duration-fast',
                      theme === option
                        ? 'bg-surface3 text-text-primary shadow-glowSoft'
                        : 'text-text-secondary hover:text-text-primary'
                    ].join(' ')}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            {updateStatus?.updateAvailable && (
              <div className="flex w-full max-w-md items-center justify-between rounded-nlg border border-emerald-dim bg-surface1 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {updateStatus.latestVersion &&
                    updateStatus.latestVersion !== updateStatus.currentVersion
                      ? `Update to version ${updateStatus.latestVersion}`
                      : 'Update available'}
                  </p>
                  <p className="text-xs text-text-muted">
                    Currently on v{updateStatus.currentVersion}
                    {updateStatus.currentCommit &&
                      ` (${updateStatus.currentCommit.slice(0, 7)})`}
                  </p>
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="rounded-nsm border border-emerald-dim bg-surface2 px-3 py-1.5 text-sm text-emerald transition-colors duration-fast hover:bg-surface3 hover:shadow-glowSoft disabled:opacity-50"
                >
                  {updating ? 'Updating…' : 'Update'}
                </button>
              </div>
            )}
            {updateStatus?.error && (
              <div className="w-full max-w-md rounded-nlg border border-nexusBorder bg-surface1 px-5 py-4">
                <p className="text-sm font-medium text-text-primary">
                  Update check unavailable
                </p>
                <p className="mt-1 break-words text-xs text-text-muted">{updateStatus.error}</p>
              </div>
            )}
            <div className="max-w-md rounded-nlg border border-nexusBorder bg-glass p-8 text-center backdrop-blur-glass">
              <p className="text-sm leading-relaxed text-text-secondary">
                {settingsDescription}
              </p>
            </div>
          </div>
        ) : (
          <RoadmapView />
        )}
      </div>
    </div>
  )
}
