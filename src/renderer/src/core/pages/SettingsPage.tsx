import { useState } from 'react'
import RoadmapView from '../components/RoadmapView'
import { coreWorkspaces } from '../nav'

const settingsDescription = coreWorkspaces.find((w) => w.id === 'settings')!.description

type SettingsTab = 'general' | 'roadmap'

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'roadmap', label: 'Roadmap' }
]

export default function SettingsPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

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
          <div className="flex h-full items-center justify-center px-8">
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
