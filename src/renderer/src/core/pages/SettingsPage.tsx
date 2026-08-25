import { useState } from 'react'
import RoadmapView from '../components/RoadmapView'
import { coreWorkspaces } from '../nav'
import type { UpdateStatus } from '../../../../shared/update'

const settingsDescription = coreWorkspaces.find((w) => w.id === 'settings')!.description

type SettingsTab = 'general' | 'roadmap'

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'roadmap', label: 'Roadmap' }
]

export default function SettingsPage({
  updateStatus
}: {
  updateStatus: UpdateStatus | null
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
            {updateStatus?.updateAvailable && (
              <div className="flex w-full max-w-md items-center justify-between rounded-nlg border border-emerald-dim bg-surface1 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Update to version {updateStatus.latestVersion}
                  </p>
                  <p className="text-xs text-text-muted">
                    Currently on v{updateStatus.currentVersion}
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
