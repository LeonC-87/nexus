import { Link, NavLink } from 'react-router-dom'
import { coreWorkspaces, modules } from '../nav'
import type { UpdateStatus } from '../../../../shared/update'
import NexusWordmark from './NexusWordmark'
import NavIcon from './NavIcon'

function NavRow({
  id,
  label,
  path,
  collapsed
}: {
  id: string
  label: string
  path: string
  collapsed: boolean
}): JSX.Element {
  return (
    <NavLink
      to={path}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          'flex items-center rounded-nsm text-sm transition-colors duration-fast',
          collapsed ? 'justify-center px-2 py-2' : 'gap-2 px-3 py-2',
          isActive
            ? 'bg-surface3 text-text-primary shadow-glowSoft'
            : 'text-text-secondary hover:bg-surface2 hover:text-text-primary'
        ].join(' ')
      }
    >
      <NavIcon id={id} className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}

export default function Sidebar({
  updateStatus,
  width,
  onResizeStart,
  collapsed,
  onToggleCollapsed
}: {
  updateStatus: UpdateStatus | null
  width: number
  onResizeStart: (event: React.MouseEvent) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}): JSX.Element {
  return (
    <aside
      style={{ width: collapsed ? 64 : width }}
      className="relative flex h-full shrink-0 flex-col border-r border-nexusBorder bg-surface1 px-3 py-4 transition-[width] duration-fast"
    >
      {!collapsed && (
        <div
          onMouseDown={onResizeStart}
          data-direction="right"
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-emerald-dim"
        />
      )}

      <button
        onClick={onToggleCollapsed}
        title={collapsed ? 'Expand' : 'Collapse'}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-nexusBorder bg-surface2 text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary"
      >
        {collapsed ? '›' : '‹'}
      </button>

      <div className="mb-1 flex justify-center px-2">
        {collapsed ? (
          <span className="text-xl font-bold text-emerald">N</span>
        ) : (
          <NexusWordmark className="h-10 w-auto" />
        )}
      </div>

      {!collapsed && (
        <div className="mb-5 flex justify-center px-2 text-center">
          {updateStatus?.updateAvailable ? (
            <Link to="/settings" className="text-xs text-emerald hover:underline">
              Update available: v{updateStatus.latestVersion}
            </Link>
          ) : updateStatus?.checked && !updateStatus.error ? (
            <span className="text-xs text-text-muted">
              Up to date &middot; v{updateStatus.currentVersion}
            </span>
          ) : updateStatus?.error ? (
            <Link
              to="/settings"
              title={updateStatus.error}
              className="text-xs text-text-muted opacity-60 hover:underline"
            >
              Update check unavailable
            </Link>
          ) : (
            <span className="text-xs text-text-muted opacity-0">placeholder</span>
          )}
        </div>
      )}

      <nav className={['flex flex-col gap-1', collapsed ? 'mt-4' : ''].join(' ')}>
        {coreWorkspaces.map((item) => (
          <NavRow key={item.id} id={item.id} label={item.label} path={item.path} collapsed={collapsed} />
        ))}
      </nav>

      {!collapsed && (
        <div className="mt-6 px-2 text-xs font-medium uppercase tracking-wider text-text-muted">
          Modules
        </div>
      )}
      <nav className={['flex flex-col gap-1', collapsed ? 'mt-1' : 'mt-2'].join(' ')}>
        {modules.map((item) => (
          <NavRow key={item.id} id={item.id} label={item.label} path={item.path} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  )
}
