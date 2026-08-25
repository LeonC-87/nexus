// Pure types, no Electron/Node dependencies - safe to import from both the
// preload bridge and the renderer without pulling in ambient types that
// belong only to one side of the context-isolation boundary.

export interface RoadmapItem {
  id: number
  version: string
  title: string
  description: string
  status: 'planned' | 'in_progress' | 'completed'
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type RoadmapItemInput = {
  version: string
  title: string
  description: string
  status: RoadmapItem['status']
}
