import { useCallback, useEffect, useRef, useState } from 'react'

// Per-viewer UI convenience (panel width), not app data - localStorage is the
// right tool here, not the main-process settings DB (see settings.ts, which
// is for things that should persist as part of the installation's data).
export function useResizableWidth(
  storageKey: string,
  defaultWidth: number,
  min: number,
  max: number
): {
  width: number
  onDragStart: (event: React.MouseEvent) => void
} {
  const [width, setWidth] = useState<number>(() => {
    const stored = Number(localStorage.getItem(storageKey))
    return stored >= min && stored <= max ? stored : defaultWidth
  })
  const draggingRef = useRef<{ startX: number; startWidth: number; direction: 1 | -1 } | null>(
    null
  )

  const onDragStart = useCallback(
    (event: React.MouseEvent) => {
      draggingRef.current = {
        startX: event.clientX,
        startWidth: width,
        direction: (event.currentTarget as HTMLElement).dataset.direction === 'left' ? -1 : 1
      }
      event.preventDefault()
    },
    [width]
  )

  useEffect(() => {
    function onMouseMove(event: MouseEvent): void {
      const drag = draggingRef.current
      if (!drag) return
      const delta = (event.clientX - drag.startX) * drag.direction
      const next = Math.min(max, Math.max(min, drag.startWidth + delta))
      setWidth(next)
    }
    function onMouseUp(): void {
      if (!draggingRef.current) return
      draggingRef.current = null
      setWidth((current) => {
        localStorage.setItem(storageKey, String(current))
        return current
      })
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [storageKey, min, max])

  return { width, onDragStart }
}
