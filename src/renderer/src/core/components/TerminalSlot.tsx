import { useEffect, useRef, useState } from 'react'
import TerminalView, { type TerminalViewHandle } from './TerminalView'

export default function TerminalSlot({ showPopoutButton = true }: { showPopoutButton?: boolean }): JSX.Element {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [poppedOut, setPoppedOut] = useState(false)
  const viewRef = useRef<TerminalViewHandle>(null)

  useEffect(() => {
    if (running && !sessionId) {
      window.nexus.terminal.create(80, 24).then(setSessionId)
    }
  }, [running, sessionId])

  useEffect(() => {
    if (!sessionId) return
    return window.nexus.terminal.onPopoutClosed((id) => {
      if (id === sessionId) setPoppedOut(false)
    })
  }, [sessionId])

  function handleStart(): void {
    setRunning(true)
  }

  function handleClose(): void {
    if (sessionId) window.nexus.terminal.dispose(sessionId)
    setSessionId(null)
    setRunning(false)
    setPoppedOut(false)
  }

  function handleRestart(): void {
    if (sessionId) window.nexus.terminal.dispose(sessionId)
    setSessionId(null)
    setPoppedOut(false)
    setRunning(true)
  }

  function handlePopout(): void {
    if (!sessionId) return
    window.nexus.terminal.popout(sessionId)
    setPoppedOut(true)
  }

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleStart}
          disabled={running}
          className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40"
        >
          Start
        </button>
        <button
          onClick={handleClose}
          disabled={!running}
          className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40"
        >
          Close
        </button>
        <button
          onClick={handleRestart}
          className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary"
        >
          Restart
        </button>
        <button
          onClick={() => viewRef.current?.clear()}
          disabled={!running || poppedOut}
          className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40"
        >
          Clear
        </button>
        {showPopoutButton && (
          <button
            onClick={handlePopout}
            disabled={!sessionId || poppedOut}
            className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40"
          >
            Pop out
          </button>
        )}
      </div>

      {sessionId && !poppedOut ? (
        <TerminalView ref={viewRef} sessionId={sessionId} />
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-nmd bg-surface1 p-2">
          <p className="text-sm text-text-muted">
            {poppedOut ? 'Showing in a separate window' : 'Terminal stopped'}
          </p>
        </div>
      )}
    </div>
  )
}
