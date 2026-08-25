// Every v0.1 surface is genuinely blank: title + purpose description only.
// No widgets, stats or reconstructed Command Nexus content yet - see
// docs/NAV_STRUCTURE.md and the Nexus Product Discovery IA notes.
export default function EmptyPage({
  title,
  description
}: {
  title: string
  description: string
}): JSX.Element {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-nexusBorder px-8 py-6">
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
      </header>
      <div className="flex flex-1 items-center justify-center px-8">
        <div className="max-w-md rounded-nlg border border-nexusBorder bg-glass p-8 text-center backdrop-blur-glass">
          <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
        </div>
      </div>
    </div>
  )
}
