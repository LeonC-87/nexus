import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import TerminalView, { type TerminalViewHandle } from '../components/TerminalView'

// Full-window display for a session popped out of the main SidePanel. The
// session itself lives in the main process and keeps running regardless of
// this window - closing it just detaches the view, it doesn't stop it.
export default function PopoutTerminalPage(): JSX.Element {
  const { sessionId } = useParams<{ sessionId: string }>()
  const viewRef = useRef<TerminalViewHandle>(null)

  if (!sessionId) return <div className="h-screen w-screen bg-canvas" />

  return (
    <div className="flex h-screen w-screen flex-col gap-2 bg-canvas p-3 text-text-primary">
      <div className="flex gap-2">
        <button
          onClick={() => viewRef.current?.clear()}
          className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary"
        >
          Clear
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <TerminalView ref={viewRef} sessionId={sessionId} />
      </div>
    </div>
  )
}
