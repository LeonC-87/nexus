import { useEffect, useState } from 'react'
import type { RoadmapItem, RoadmapItemInput } from '../../../../shared/roadmap'

const statusLabel: Record<RoadmapItem['status'], string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  completed: 'Completed'
}

const statusOrder: RoadmapItem['status'][] = ['in_progress', 'planned', 'completed']

const emptyDraft: RoadmapItemInput = {
  version: '',
  title: '',
  description: '',
  status: 'planned'
}

export default function RoadmapView(): JSX.Element {
  const [items, setItems] = useState<RoadmapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [draft, setDraft] = useState<RoadmapItemInput>(emptyDraft)

  async function refresh(): Promise<void> {
    const list = await window.nexus.roadmap.list()
    setItems(list)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  function startNew(): void {
    setDraft(emptyDraft)
    setEditingId('new')
  }

  function startEdit(item: RoadmapItem): void {
    setDraft({
      version: item.version,
      title: item.title,
      description: item.description,
      status: item.status
    })
    setEditingId(item.id)
  }

  function cancelEdit(): void {
    setEditingId(null)
    setDraft(emptyDraft)
  }

  async function saveDraft(): Promise<void> {
    if (!draft.title.trim()) return

    if (editingId === 'new') {
      await window.nexus.roadmap.create(draft)
    } else if (typeof editingId === 'number') {
      await window.nexus.roadmap.update(editingId, draft)
    }
    cancelEdit()
    await refresh()
  }

  async function removeItem(id: number): Promise<void> {
    await window.nexus.roadmap.delete(id)
    if (editingId === id) cancelEdit()
    await refresh()
  }

  const sortedItems = [...items].sort((a, b) => {
    const statusDiff = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    if (statusDiff !== 0) return statusDiff
    return a.sortOrder - b.sortOrder
  })

  return (
    <div className="px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">Nexus's own development roadmap.</p>
        <button
          onClick={startNew}
          className="rounded-nsm border border-emerald-dim bg-surface2 px-3 py-1.5 text-sm text-emerald transition-colors duration-fast hover:bg-surface3 hover:shadow-glowSoft"
        >
          + Add item
        </button>
      </div>

      {editingId === 'new' && (
        <RoadmapForm draft={draft} setDraft={setDraft} onSave={saveDraft} onCancel={cancelEdit} />
      )}

      {loading ? (
        <p className="text-sm text-text-muted">Loading...</p>
      ) : sortedItems.length === 0 && editingId !== 'new' ? (
        <div className="rounded-nlg border border-nexusBorder bg-glass p-8 text-center backdrop-blur-glass">
          <p className="text-sm text-text-secondary">No roadmap items yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedItems.map((item) =>
            editingId === item.id ? (
              <RoadmapForm
                key={item.id}
                draft={draft}
                setDraft={setDraft}
                onSave={saveDraft}
                onCancel={cancelEdit}
              />
            ) : (
              <div
                key={item.id}
                className="group flex items-start justify-between rounded-nmd border border-nexusBorder bg-surface1 px-4 py-3 transition-colors duration-fast hover:border-nexusBorderStrong"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {item.version && (
                      <span className="rounded-nsm bg-surface2 px-1.5 py-0.5 text-xs text-text-muted">
                        {item.version}
                      </span>
                    )}
                    <span
                      className={[
                        'rounded-nsm px-1.5 py-0.5 text-xs',
                        item.status === 'completed'
                          ? 'bg-emerald-dim/30 text-emerald'
                          : item.status === 'in_progress'
                            ? 'bg-surface3 text-text-primary'
                            : 'text-text-muted'
                      ].join(' ')}
                    >
                      {statusLabel[item.status]}
                    </span>
                    <span className="text-sm font-medium text-text-primary">{item.title}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-text-secondary">{item.description}</p>
                  )}
                </div>
                <div className="ml-4 flex gap-2 opacity-0 transition-opacity duration-fast group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-text-secondary hover:text-emerald"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-text-secondary hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

function RoadmapForm({
  draft,
  setDraft,
  onSave,
  onCancel
}: {
  draft: RoadmapItemInput
  setDraft: (d: RoadmapItemInput) => void
  onSave: () => void
  onCancel: () => void
}): JSX.Element {
  return (
    <div className="mb-2 flex flex-col gap-2 rounded-nmd border border-emerald-dim bg-surface1 p-4">
      <div className="flex gap-2">
        <input
          value={draft.version}
          onChange={(e) => setDraft({ ...draft, version: e.target.value })}
          placeholder="v0.0.1"
          className="w-24 rounded-nsm border border-nexusBorder bg-surface2 px-2 py-1.5 text-sm text-text-primary outline-none focus:border-emerald"
        />
        <input
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Title"
          className="flex-1 rounded-nsm border border-nexusBorder bg-surface2 px-2 py-1.5 text-sm text-text-primary outline-none focus:border-emerald"
        />
        <select
          value={draft.status}
          onChange={(e) =>
            setDraft({ ...draft, status: e.target.value as RoadmapItemInput['status'] })
          }
          className="rounded-nsm border border-nexusBorder bg-surface2 px-2 py-1.5 text-sm text-text-primary outline-none focus:border-emerald"
        >
          <option value="planned">Planned</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder="Description (optional)"
        rows={2}
        className="rounded-nsm border border-nexusBorder bg-surface2 px-2 py-1.5 text-sm text-text-primary outline-none focus:border-emerald"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-nsm px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="rounded-nsm border border-emerald-dim bg-surface2 px-3 py-1.5 text-sm text-emerald hover:bg-surface3 hover:shadow-glowSoft"
        >
          Save
        </button>
      </div>
    </div>
  )
}
