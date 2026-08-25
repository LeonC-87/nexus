import { getDatabase } from './db'
import type { RoadmapItem } from '../shared/roadmap'

interface RoadmapRow {
  id: number
  version: string
  title: string
  description: string
  status: string
  sort_order: number
  created_at: string
  updated_at: string
}

function toItem(row: RoadmapRow): RoadmapItem {
  return {
    id: row.id,
    version: row.version,
    title: row.title,
    description: row.description,
    status: row.status as RoadmapItem['status'],
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function listRoadmapItems(): RoadmapItem[] {
  const rows = getDatabase()
    .prepare('SELECT * FROM nexus_roadmap ORDER BY sort_order ASC, id ASC')
    .all() as RoadmapRow[]
  return rows.map(toItem)
}

export function createRoadmapItem(input: {
  version: string
  title: string
  description: string
  status: RoadmapItem['status']
}): RoadmapItem {
  const db = getDatabase()
  const maxOrder = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM nexus_roadmap')
    .get() as { maxOrder: number }

  const result = db
    .prepare(
      `INSERT INTO nexus_roadmap (version, title, description, status, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    )
    .run(input.version, input.title, input.description, input.status, maxOrder.maxOrder + 1)

  return toItem(
    db.prepare('SELECT * FROM nexus_roadmap WHERE id = ?').get(result.lastInsertRowid) as RoadmapRow
  )
}

export function updateRoadmapItem(
  id: number,
  input: Partial<{
    version: string
    title: string
    description: string
    status: RoadmapItem['status']
    sortOrder: number
  }>
): RoadmapItem {
  const db = getDatabase()
  const existing = db.prepare('SELECT * FROM nexus_roadmap WHERE id = ?').get(id) as
    | RoadmapRow
    | undefined
  if (!existing) throw new Error(`Roadmap item ${id} not found`)

  const merged = {
    version: input.version ?? existing.version,
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    status: input.status ?? existing.status,
    sort_order: input.sortOrder ?? existing.sort_order
  }

  db.prepare(
    `UPDATE nexus_roadmap
     SET version = ?, title = ?, description = ?, status = ?, sort_order = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(merged.version, merged.title, merged.description, merged.status, merged.sort_order, id)

  return toItem(db.prepare('SELECT * FROM nexus_roadmap WHERE id = ?').get(id) as RoadmapRow)
}

export function deleteRoadmapItem(id: number): void {
  getDatabase().prepare('DELETE FROM nexus_roadmap WHERE id = ?').run(id)
}
