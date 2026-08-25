import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// Core persistence layer. Each Nexus installation owns one local database.
// Schema/app versioning is tracked from day one so future updates can migrate
// user data safely instead of assuming a fresh install - see
// docs/NAV_STRUCTURE.md and the Nexus Product Discovery notes on the
// distributable-product requirement.

const SCHEMA_VERSION = 1

let db: Database.Database | null = null

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

  const existing = db
    .prepare('SELECT value FROM nexus_meta WHERE key = ?')
    .get('schema_version') as { value: string } | undefined

  if (!existing) {
    db.prepare('INSERT INTO nexus_meta (key, value) VALUES (?, ?)').run(
      'schema_version',
      String(SCHEMA_VERSION)
    )
    db.prepare('INSERT INTO nexus_meta (key, value) VALUES (?, ?)').run(
      'app_version',
      app.getVersion()
    )
  }

  return db
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database not initialized - call initDatabase() first')
  return db
}
