import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// Core persistence layer. Each Nexus installation owns one local database.
// Schema/app versioning is tracked from day one so future updates can migrate
// user data safely instead of assuming a fresh install - see
// docs/NAV_STRUCTURE.md and the Nexus Product Discovery notes on the
// distributable-product requirement.

const SCHEMA_VERSION = 2

let db: Database.Database | null = null

function getSchemaVersion(database: Database.Database): number {
  const row = database
    .prepare('SELECT value FROM nexus_meta WHERE key = ?')
    .get('schema_version') as { value: string } | undefined
  return row ? Number(row.value) : 0
}

function setSchemaVersion(database: Database.Database, version: number): void {
  database
    .prepare(
      'INSERT INTO nexus_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    )
    .run('schema_version', String(version))
}

function migrate(database: Database.Database): void {
  const current = getSchemaVersion(database)

  if (current < 1) {
    database
      .prepare(
        'INSERT INTO nexus_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
      )
      .run('app_version', app.getVersion())
    setSchemaVersion(database, 1)
  }

  if (current < 2) {
    // Nexus's own development roadmap - a Settings/Core concern (meta info about
    // this installation's Nexus app itself), not a Personal/Projects module domain.
    database.exec(`
      CREATE TABLE IF NOT EXISTS nexus_roadmap (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'planned',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    setSchemaVersion(database, 2)
  }

  if (getSchemaVersion(database) !== SCHEMA_VERSION) {
    throw new Error(
      `Migration left schema at version ${getSchemaVersion(database)}, expected ${SCHEMA_VERSION}`
    )
  }
}

export function initDatabase(): Database.Database {
  if (db) return db

  const dataDir = join(app.getPath('userData'), 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = join(dataDir, 'nexus.sqlite')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS nexus_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  migrate(db)

  return db
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database not initialized - call initDatabase() first')
  return db
}
