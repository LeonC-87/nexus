import { useState } from 'react'

export function useLocalStorageState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  function set(next: T): void {
    setValue(next)
    localStorage.setItem(key, JSON.stringify(next))
  }

  return [value, set]
}
