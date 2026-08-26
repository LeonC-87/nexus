import { useEffect, useRef, useState } from 'react'
import type { BrowserTabState } from '../../../../shared/browser'

interface Bookmark {
  url: string
  title: string
}

const BOOKMARKS_KEY = 'nexus.browserBookmarks'

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// A real embedded Chromium surface (main-process WebContentsView), not an
// iframe - Google and most identity providers block sign-in inside iframes/
// <webview>. The dark placeholder div below is purely a positioning
// reference: its on-screen rect is reported to the main process so it can
// place the native view exactly on top of it.
export default function BrowserPanel(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const [running, setRunning] = useState(false)
  const [tabs, setTabs] = useState<BrowserTabState[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [poppedOutTabId, setPoppedOutTabId] = useState<string | null>(null)
  const [addressInput, setAddressInput] = useState('')
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => loadBookmarks())

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null
  const isBookmarked = !!activeTab && bookmarks.some((b) => b.url === activeTab.url)
  const isActivePoppedOut = activeTabId !== null && activeTabId === poppedOutTabId

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    const removeUpdated = window.nexus.browser.onTabUpdated((tab) => {
      setTabs((prev) => {
        const exists = prev.some((t) => t.id === tab.id)
        return exists ? prev.map((t) => (t.id === tab.id ? tab : t)) : [...prev, tab]
      })
    })
    const removeClosed = window.nexus.browser.onTabClosed((id) => {
      setTabs((prev) => prev.filter((t) => t.id !== id))
      setActiveTabId((current) => (current === id ? null : current))
    })
    const removePopoutClosed = window.nexus.browser.onPopoutClosed((id) => {
      setPoppedOutTabId((current) => (current === id ? null : current))
    })
    return () => {
      removeUpdated()
      removeClosed()
      removePopoutClosed()
    }
  }, [])

  useEffect(() => {
    setAddressInput(activeTab?.url ?? '')
  }, [activeTab?.id, activeTab?.url])

  function reportBounds(): void {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    window.nexus.browser.setBounds({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    })
  }

  useEffect(() => {
    if (!running || !activeTabId || isActivePoppedOut) return
    reportBounds()
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(reportBounds)
    observer.observe(el)
    window.addEventListener('resize', reportBounds)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', reportBounds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, activeTabId, isActivePoppedOut])

  // Re-attach visually once a popped-out tab's window is closed.
  useEffect(() => {
    if (poppedOutTabId) return
    if (!activeTabId) return
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    window.nexus.browser.switchTab(activeTabId, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poppedOutTabId])

  useEffect(() => {
    // Leaving the Browser panel entirely - detach the native view so it
    // can't linger on screen over other content.
    return () => {
      window.nexus.browser.hide()
    }
  }, [])

  async function handleStart(): Promise<void> {
    setRunning(true)
    const id = await window.nexus.browser.createTab()
    setActiveTabId(id)
    requestAnimationFrame(() => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      window.nexus.browser.switchTab(id, {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      })
    })
  }

  async function handleClose(): Promise<void> {
    await window.nexus.browser.closeAll()
    setTabs([])
    setActiveTabId(null)
    setPoppedOutTabId(null)
    setRunning(false)
  }

  async function handleNewTab(): Promise<void> {
    const id = await window.nexus.browser.createTab()
    await switchToTab(id)
  }

  async function switchToTab(id: string): Promise<void> {
    const el = containerRef.current
    const rect = el?.getBoundingClientRect()
    setActiveTabId(id)
    if (rect && id !== poppedOutTabId) {
      await window.nexus.browser.switchTab(id, {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      })
    }
  }

  async function handleCloseTab(id: string): Promise<void> {
    await window.nexus.browser.closeTab(id)
    if (poppedOutTabId === id) setPoppedOutTabId(null)
    if (activeTabId === id) {
      const remaining = tabs.filter((t) => t.id !== id)
      if (remaining.length > 0) await switchToTab(remaining[0].id)
    }
  }

  function handleNavigate(): void {
    if (activeTabId && addressInput.trim()) {
      window.nexus.browser.navigate(activeTabId, addressInput.trim())
    }
  }

  function handleOpenInChrome(): void {
    const url = activeTab?.url || addressInput.trim()
    if (url) window.nexus.browser.openExternal(url)
  }

  function handlePopout(): void {
    if (!activeTabId) return
    window.nexus.browser.popout(activeTabId)
    setPoppedOutTabId(activeTabId)
  }

  function toggleBookmark(): void {
    if (!activeTab) return
    setBookmarks((prev) =>
      isBookmarked
        ? prev.filter((b) => b.url !== activeTab.url)
        : [...prev, { url: activeTab.url, title: activeTab.title || activeTab.url }]
    )
  }

  function openBookmark(url: string): void {
    if (activeTabId) window.nexus.browser.navigate(activeTabId, url)
  }

  return (
    <div className="flex h-full w-full flex-col gap-2">
      {/* Tab strip - tabs on the left, window-level controls on the right,
          same ordering as a real browser (tabs above the address bar). */}
      <div className="flex flex-wrap items-center gap-1">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => switchToTab(tab.id)}
            className={[
              'flex max-w-[180px] cursor-pointer items-center gap-2 rounded-nsm px-3 py-1 text-xs transition-colors duration-fast',
              tab.id === activeTabId
                ? 'bg-surface3 text-text-primary shadow-glowSoft'
                : 'bg-surface2 text-text-secondary hover:bg-surface3 hover:text-text-primary'
            ].join(' ')}
          >
            <span className="truncate">{tab.isLoading ? 'Loading…' : tab.title || 'New Tab'}</span>
            {tab.id === poppedOutTabId && <span className="shrink-0 text-text-muted">⧉</span>}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCloseTab(tab.id)
              }}
              className="shrink-0 text-text-muted hover:text-text-primary"
            >
              ×
            </button>
          </div>
        ))}
        {running && (
          <button
            onClick={handleNewTab}
            className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary"
          >
            + New Tab
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={handlePopout}
          disabled={!running || !activeTab || isActivePoppedOut}
          className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40"
        >
          Pop out
        </button>
        <button
          onClick={handleOpenInChrome}
          disabled={!running || !activeTab}
          className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40"
        >
          Open in Chrome
        </button>
        <button
          onClick={handleStart}
          disabled={running}
          className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40 disabled:hover:bg-surface2"
        >
          Start
        </button>
        <button
          onClick={handleClose}
          disabled={!running}
          className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40 disabled:hover:bg-surface2"
        >
          Close
        </button>
      </div>

      {running && (
        <>
          {/* Address bar row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => activeTabId && window.nexus.browser.goBack(activeTabId)}
              disabled={!activeTab?.canGoBack}
              className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40"
            >
              Back
            </button>
            <button
              onClick={() => activeTabId && window.nexus.browser.goForward(activeTabId)}
              disabled={!activeTab?.canGoForward}
              className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary disabled:opacity-40"
            >
              Forward
            </button>
            <button
              onClick={() => activeTabId && window.nexus.browser.reload(activeTabId)}
              className="rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary"
            >
              Reload
            </button>
            <input
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
              placeholder="Search or enter address"
              className="min-w-[200px] flex-1 rounded-nsm border border-nexusBorder bg-surface2 px-3 py-1 text-xs text-text-primary outline-none focus:border-emerald-dim"
            />
            <button
              onClick={toggleBookmark}
              disabled={!activeTab}
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              className={[
                'rounded-nsm border border-nexusBorder px-3 py-1 text-xs transition-colors duration-fast disabled:opacity-40',
                isBookmarked
                  ? 'bg-surface3 text-emerald'
                  : 'bg-surface2 text-text-secondary hover:bg-surface3 hover:text-text-primary'
              ].join(' ')}
            >
              {isBookmarked ? '★' : '☆'}
            </button>
          </div>

          {/* Bookmarks bar */}
          {bookmarks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmarks.map((b) => (
                <div
                  key={b.url}
                  onClick={() => openBookmark(b.url)}
                  className="flex max-w-[160px] cursor-pointer items-center gap-2 rounded-nsm bg-surface2 px-3 py-1 text-xs text-text-secondary transition-colors duration-fast hover:bg-surface3 hover:text-text-primary"
                >
                  <span className="truncate">{b.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setBookmarks((prev) => prev.filter((x) => x.url !== b.url))
                    }}
                    className="shrink-0 text-text-muted hover:text-text-primary"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {running && !isActivePoppedOut ? (
        <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden rounded-nmd bg-surface1" />
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-nmd bg-surface1 p-2">
          <p className="text-sm text-text-muted">
            {isActivePoppedOut ? 'Showing in a separate window' : 'Browser stopped'}
          </p>
        </div>
      )}
    </div>
  )
}
