import { getDatabase } from './db'
import { DEFAULT_THEME, type Theme } from '../shared/theme'

// Small key/value app settings, distinct from module domain data - reuses
// the existing nexus_meta table (see db.ts) rather than a new table.

export function getTheme(): Theme {
  const row = getDatabase()
    .prepare('SELECT value FROM nexus_meta WHERE key = ?')
    .get('theme') as { value: string } | undefined
  return row?.value === 'light' ? 'light' : row?.value === 'dark' ? 'dark' : DEFAULT_THEME
}

export function setTheme(theme: Theme): Theme {
  getDatabase()
    .prepare(
      'INSERT INTO nexus_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    )
    .run('theme', theme)
  return theme
}
