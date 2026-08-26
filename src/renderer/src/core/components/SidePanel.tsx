import TerminalSlot from './TerminalSlot'
import BrowserPanel from './BrowserPanel'
import { useResizableHeight } from '../hooks/useResizableHeight'

export default function SidePanel({
  width,
  onResizeStart,
  collapsed,
  onToggleCollapsed
}: {
  width: number
  onResizeStart: (event: React.MouseEvent) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}): JSX.Element {
  const split = useResizableHeight('nexus.sidePanelSplit', 360, 160, 900)

  return (
    <aside
      style={{ width: collapsed ? 48 : width }}
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-l border-nexusBorder bg-surface1 transition-[width] duration-fast"
    >
      {!collapsed && (
        <div
          onMouseDown={onResizeStart}
          data-direction="left"
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-emerald-dim"
        />
      )}

      <button
        onClick={onToggleCollapsed}
        title={collapsed ? 'Expand' : 'Collapse'}
        className="absolute -left-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-nexusBorder bg-surface2 text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary"
      >
        {collapsed ? '‹' : '›'}
      </button>

      {/* Collapsed-state labels - overlaid, doesn't affect the real content
          tree below so Terminal/Browser never remount when toggling. */}
      {collapsed && (
        <div className="flex flex-col items-center gap-4 pt-14 text-xs uppercase tracking-wider text-text-muted">
          <span style={{ writingMode: 'vertical-rl' }}>Terminal</span>
          <span style={{ writingMode: 'vertical-rl' }}>Browser</span>
        </div>
      )}

      {/* Real content - always mounted (so both sessions survive collapsing
          the panel); zero-sized and non-interactive while collapsed. */}
      <div
        style={collapsed ? { width: 0, height: 0, overflow: 'hidden' } : undefined}
        className={collapsed ? '' : 'flex h-full flex-col p-3'}
      >
        <div className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-text-muted">
          Terminal
        </div>
        <div
          style={{ height: collapsed ? 0 : split.height, width: collapsed ? 0 : undefined, overflow: 'hidden' }}
          className="min-h-0"
        >
          <TerminalSlot />
        </div>

        <div
          onMouseDown={split.onDragStart}
          className="my-2 h-1 shrink-0 cursor-row-resize rounded-nsm hover:bg-emerald-dim"
        />

        <div className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-text-muted">
          Browser
        </div>
        <div
          style={collapsed ? { height: 0, width: 0, overflow: 'hidden' } : undefined}
          className={collapsed ? '' : 'min-h-0 flex-1'}
        >
          <BrowserPanel />
        </div>
      </div>
    </aside>
  )
}
