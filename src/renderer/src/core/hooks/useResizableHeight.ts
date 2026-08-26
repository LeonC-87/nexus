import { useCallback, useEffect, useRef, useState } from 'react'

// Vertical counterpart to useResizableWidth - splits the right-hand panel
// into a resizable Terminal/Browser stack.
export function useResizableHeight(
  storageKey: string,
  defaultHeight: number,
  min: number,
  max: number
): {
  height: number
  onDragStart: (event: React.MouseEvent) => void
} {
  const [height, setHeight] = useState<number>(() => {
    const stored = Number(localStorage.getItem(storageKey))
    return stored >= min && stored <= max ? stored : defaultHeight
  })
  const draggingRef = useRef<{ startY: number; startHeight: number } | null>(null)

  const onDragStart = useCallback(
    (event: React.MouseEvent) => {
      draggingRef.current = { startY: event.clientY, startHeight: height }
      event.preventDefault()
    },
    [height]
  )

  useEffect(() => {
    function onMouseMove(event: MouseEvent): void {
      const drag = draggingRef.current
      if (!drag) return
      const delta = event.clientY - drag.startY
      const next = Math.min(max, Math.max(min, drag.startHeight + delta))
      setHeight(next)
    }
    function onMouseUp(): void {
      if (!draggingRef.current) return
      draggingRef.current = null
      setHeight((current) => {
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

  return { height, onDragStart }
}
