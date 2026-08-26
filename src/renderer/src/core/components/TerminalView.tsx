import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export interface TerminalViewHandle {
  clear: () => void
}

// Pure display: attaches an xterm.js UI to an EXISTING PTY session (owned
// and kept alive by the main process regardless of which window is showing
// it) rather than creating/destroying one itself. This is what lets a
// session survive being popped out into its own window and back.
const TerminalView = forwardRef<TerminalViewHandle, { sessionId: string }>(function TerminalView(
  { sessionId },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<XTerm | null>(null)

  useImperativeHandle(ref, () => ({
    clear: () => termRef.current?.clear()
  }))

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const term = new XTerm({
      convertEol: true,
      cursorBlink: true,
      fontFamily: 'Consolas, "Cascadia Code", monospace',
      fontSize: 13,
      theme: {
        background: '#101512',
        foreground: '#e8f3ee',
        cursor: '#34d399'
      }
    })
    termRef.current = term
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(container)
    fitAddon.fit()
    window.nexus.terminal.resize(sessionId, term.cols, term.rows)

    const removeData = window.nexus.terminal.onData((id, data) => {
      if (id === sessionId) term.write(data)
    })
    const onTermData = term.onData((data) => window.nexus.terminal.write(sessionId, data))

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit()
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        window.nexus.terminal.resize(sessionId, term.cols, term.rows)
      }, 100)
    })
    resizeObserver.observe(container)

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeObserver.disconnect()
      onTermData.dispose()
      removeData()
      term.dispose()
      termRef.current = null
    }
  }, [sessionId])

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden rounded-nmd bg-surface1 p-2" />
  )
})

export default TerminalView
