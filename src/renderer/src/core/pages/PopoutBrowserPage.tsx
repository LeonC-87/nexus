// Full-window host for a browser tab popped out of the main SidePanel.
// The main process fills this entire window with the tab's native
// WebContentsView (see browserTabs.ts popoutTab) - this page is otherwise
// blank. Navigation/back/forward/reload still work from the main panel's
// toolbar while popped out, since they operate on the tab id regardless of
// which window is currently displaying it.
export default function PopoutBrowserPage(): JSX.Element {
  return <div className="h-screen w-screen bg-canvas" />
}
