import * as pty from 'node-pty'
import { BrowserWindow } from 'electron'
import { createPopoutWindow } from './popout'

// One PTY session per terminal instance. Sessions are process-lifetime only
// (not persisted) - a real interactive shell, not a command-and-response
// pipe, so PowerShell's line editing, history, colour and interactive
// prompts all work exactly as they would in a native console window.
//
// Data is broadcast to every open window rather than the single window that
// created the session, so a session can be displayed by the main window's
// panel or by a popped-out window interchangeably without restarting it.

const sessions = new Map<string, pty.IPty>()
const popouts = new Map<string, BrowserWindow>()
let nextId = 1

function broadcast(channel: string, ...args: unknown[]): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) win.webContents.send(channel, ...args)
  }
}

export function createSession(cols: number, rows: number): string {
  const id = String(nextId++)

  // -NoProfile: a plain shell, not the user's customised profile (which may
  // auto-launch other programs on shell start) - still the real system
  // powershell.exe, just without profile-script side effects.
  const shell = pty.spawn('powershell.exe', ['-NoProfile'], {
    name: 'xterm-256color',
    cols,
    rows,
    cwd: process.env.USERPROFILE || process.env.HOME,
    env: process.env as Record<string, string>
  })

  shell.onData((data) => broadcast('nexus:terminal:data', id, data))
  shell.onExit(({ exitCode }) => {
    broadcast('nexus:terminal:exit', id, exitCode)
    sessions.delete(id)
  })

  sessions.set(id, shell)
  return id
}

export function writeToSession(id: string, data: string): void {
  sessions.get(id)?.write(data)
}

export function resizeSession(id: string, cols: number, rows: number): void {
  const session = sessions.get(id)
  if (!session) return
  // node-pty throws if asked to resize to a non-positive dimension.
  if (cols <= 0 || rows <= 0) return
  session.resize(cols, rows)
}

export function disposeSession(id: string): void {
  sessions.get(id)?.kill()
  sessions.delete(id)
  const popout = popouts.get(id)
  if (popout && !popout.isDestroyed()) popout.close()
  popouts.delete(id)
}

export function disposeAllSessions(): void {
  for (const id of Array.from(sessions.keys())) {
    disposeSession(id)
  }
}

export function popoutSession(id: string, mainWindow: BrowserWindow): void {
  if (!sessions.has(id)) return
  const existing = popouts.get(id)
  if (existing && !existing.isDestroyed()) {
    existing.focus()
    return
  }
  const popout = createPopoutWindow(mainWindow, `/popout/terminal/${id}`, 'Nexus Terminal')
  popouts.set(id, popout)
  popout.on('closed', () => {
    popouts.delete(id)
    broadcast('nexus:terminal:popout-closed', id)
  })
}
