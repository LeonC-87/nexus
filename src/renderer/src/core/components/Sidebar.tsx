import { Link, NavLink } from 'react-router-dom'
import { coreWorkspaces, modules } from '../nav'
import type { UpdateStatus } from '../../../../shared/update'

function NavRow({ label, path }: { label: string; path: string }): JSX.Element {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        [
          'flex items-center rounded-nsm px-3 py-2 text-sm transition-colors',
          'duration-fast',
          isActive
            ? 'bg-surface3 text-text-primary shadow-glowSoft'
            : 'text-text-secondary hover:bg-surface2 hover:text-text-primary'
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export default function Sidebar({
  updateStatus
}: {
  updateStatus: UpdateStatus | null
}): JSX.Element {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-nexusBorder bg-surface1 px-3 py-4">
      <div className="mb-1 flex items-center gap-2 px-2">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald shadow-glow" />
        <span className="text-sm font-semibold tracking-wide text-text-primary">NEXUS</span>
      </div>

      <div className="mb-5 px-2">
        {updateStatus?.updateAvailable ? (
          <Link to="/settings" className="text-xs text-emerald hover:underline">
            Update available: v{updateStatus.latestVersion}
          </Link>
        ) : updateStatus?.checked && !updateStatus.error ? (
          <span className="text-xs text-text-muted">
            Up to date &middot; v{updateStatus.currentVersion}
          </span>
        ) : (
          <span className="text-xs text-text-muted opacity-0">placeholder</span>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {coreWorkspaces.map((item) => (
          <NavRow key={item.id} label={item.label} path={item.path} />
        ))}
      </nav>

      <div className="mt-6 px-2 text-xs font-medium uppercase tracking-wider text-text-muted">
        Modules
      </div>
      <nav className="mt-2 flex flex-col gap-1">
        {modules.map((item) => (
          <NavRow key={item.id} label={item.label} path={item.path} />
        ))}
      </nav>
    </aside>
  )
}
