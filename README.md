# Nexus

Ground-up redesign of the Command Nexus dashboard. Currently a blank v0.1 shell — nav and
routing exist, every page is an empty placeholder. Rebuilt piece by piece by Leon, with an
eventual goal of being polished/user-ready enough to give or sell to someone else.

Full product discovery (identity, user model, architecture principles, IA) was done in
collaboration with ChatGPT — see `G:\My Drive\.Nexus\01_AI_TOOLS\` for that conversation
reference. Key decisions from it:

- **Distributable product, not a personal script.** Product (code/schema) and instance
  (a user's data/config) are strictly separate. No feature may assume it's Leon's installation.
- **Core stays small; domains live in Modules.** Overview/Today/Inbox/Device/Security/Settings
  are Core workspaces that can aggregate module data but never own it. Personal and Projects
  are the only two modules that exist so far, and own their own domains.
- **Blank really means blank.** Nothing was ported from old Command Nexus — every page earns
  its content from scratch.

## Tech stack

Electron + React + TypeScript + Vite + Tailwind CSS + SQLite (better-sqlite3) + Drizzle ORM +
electron-builder. Chosen over Tauri specifically to keep the whole stack in TypeScript for a
single developer working through Claude Code — see the ChatGPT discovery conversation for the
full reasoning.

Visual language: dark charcoal canvas + emerald-green glow accents + glassmorphism, refined to
read as a polished desktop app rather than an "admin template." Design tokens live in
`src/renderer/src/core/styles/tokens.css`.

## Getting started

```
npm install
npm run dev
```

`npm install` triggers a `postinstall` step (`patch-package && electron-builder install-app-deps`)
that applies `patches/node-pty+*.patch` (see below) then rebuilds `better-sqlite3` and `node-pty`'s
native bindings against Electron's ABI — required because both are compiled modules, not pure JS.

### Windows: `node-pty` build fails with "GetCommitHash.bat is not recognized"

`node-pty`'s bundled `winpty` submodule has a real bug on Windows: its own `winpty.gyp` invokes
`cmd /c "cd shared && GetCommitHash.bat"`, and on at least this environment cmd fails to resolve
the bare filename even though the file exists in that directory (`.\GetCommitHash.bat` or the
full path both work fine — just not the bare name after `cd`). Already fixed via
`patch-package` — `patches/node-pty+1.1.0.patch` is applied automatically on every
`npm install`, no manual action needed. If `node-pty` ever gets upgraded to a new version, this
patch will need regenerating (`npx patch-package node-pty` after re-applying the same two-line
`.gyp` fix — see the patch file for exactly what changed).

### Windows prerequisite: Python `distutils`

Native module compilation (`node-gyp`) needs `distutils`, which was removed from the Python
standard library in 3.12+. If `npm install` fails with `ModuleNotFoundError: No module named
'distutils'`, run:

```
python -m pip install setuptools
```

first. (Hit and fixed on PC-MAIN 2026-08-25; likely to recur on the laptop's first clone if its
Python is also 3.12+.)

### `npm run dev` sometimes fails to open a window (no error shown)

Seen 2026-08-26 on PC-MAIN after pulling `node-pty`/terminal-panel changes: `electron-vite dev`
prints its normal success messages ("dev server running... start electron app...") but the
Electron process exits immediately afterward with no visible error, and the app window never
appears. **Confirmed the app itself is fine** — both `npm run dist` (the packaged installer) and
running the production build directly (`npm run build` then
`node_modules/electron/dist/electron.exe out/main/index.js`) work correctly. The bug is
isolated to `electron-vite dev`'s process orchestration specifically (root cause not found -
Vite reports its dev server as listening on 5173 but nothing is actually bound there when this
happens). If `npm run dev` doesn't open a window within a few seconds: fall back to
`npm run build && node_modules/electron/dist/electron.exe out/main/index.js` to keep working
while this gets investigated properly.

### Windows prerequisite: Python `distutils`

Native module compilation (`node-gyp`) needs `distutils`, which was removed from the Python
standard library in 3.12+. If `npm install` fails with `ModuleNotFoundError: No module named
'distutils'`, run:

```
python -m pip install setuptools
```

first. (Hit and fixed on PC-MAIN 2026-08-25; likely to recur on the laptop's first clone if its
Python is also 3.12+.)

## Project structure

```
src/main/       Electron main process (window, IPC handlers, Core persistence/db.ts)
src/preload/    Narrow typed bridge - renderer never gets direct Node/fs/db access
src/renderer/   React app (src/renderer/src/core = shell/nav/design tokens,
                src/renderer/src/App.tsx = routing)
```

Security baseline (locked from the discovery, do not relax): `contextIsolation: true`,
`nodeIntegration: false`, `sandbox: true`, no direct renderer filesystem/DB access - everything
goes through the preload bridge's typed API.

## Persistence

Each installation gets its own local SQLite database (`app.getPath('userData')/data/nexus.sqlite`,
i.e. per-device, never synced/shared). Schema versioning is tracked from the first commit
(`nexus_meta` table: `schema_version`, `app_version`) even though the actual updater doesn't
exist yet - so future upgrades can migrate a real user's data instead of assuming a fresh
install.

## Scope note (2026-08-25)

The ChatGPT discovery thread (`G:\My Drive\.Nexus\01_AI_TOOLS\`) has a long reconciliation
about turning Nexus into a full cloud-backed product — signed installers, accounts, cross-device
sync, a mobile companion app, freemium billing. **Leon explicitly stepped back from that same
session: "forget all that."** The plan is to keep rebuilding Nexus locally, Command-Nexus-style,
piece by piece. The one thing kept from that detour: other people (e.g. a partner) can already
run their own fully independent copy today — clone the repo, `npm install`, run it — no
accounts/cloud/sync needed for that. Treat the cloud/mobile/billing material in that ChatGPT
thread as shelved, not adopted, unless Leon revives it explicitly.

## Update check

On startup, Nexus fetches `package.json` from `LeonC-87/nexus`'s `main` branch via a plain,
unauthenticated request to `raw.githubusercontent.com` and compares its version against the
local one. If newer, a badge appears under the Nexus logo in the sidebar and a card appears in
Settings > General with an "Update" button; if up to date, the sidebar shows that instead. This
works for **any** user on **any** machine — no GitHub login, no CLI, nothing tied to Leon's own
account. That's specifically why `LeonC-87/nexus` was made public on 2026-08-25 (confirmed
no secrets in the repo first) — it was previously private and the check shelled out to Leon's
own authenticated `gh` CLI, which meant it silently failed on any machine that wasn't his own
(e.g. the laptop, or a partner's machine).

**This is still a placeholder, not the real distributable updater.** "Updating" currently means
`git pull && npm install` in the app's own directory followed by a relaunch — correct for the
current git-clone-and-`npm run dev` stage (every user still needs git + Node installed locally
to run Nexus at all), but it should be replaced with a real electron-builder/electron-updater
release-based flow once Nexus is ever packaged as an installer — see `src/main/update.ts` for
the explicit note.

## Building a Windows installer

```
npm run dist
```

Produces a real NSIS installer at `release/Nexus-<version>-setup.exe` — installs to
`AppData\Local\Programs\Nexus`, adds a Start Menu shortcut, and registers a proper uninstaller
in Windows' Add/Remove Programs. Verified working end-to-end 2026-08-26 (full install → launch
→ confirmed running as `Nexus.exe`, not a dev process → uninstall entry present).

**One-time prerequisite:** electron-builder needs to extract its bundled signing tools, which
requires symlink creation privileges. If `npm run dist` hangs retrying a `winCodeSign` download
with "Cannot create symbolic link: A required privilege is not held by the client", enable
Windows Developer Mode once (Settings → Privacy & Security → For developers), or run the build
from an elevated terminal. See `docs/environment/enable-dev-mode-elevated.ps1`.

**Known gap in this installer:** it's currently **unsigned** (no code-signing certificate) —
Windows SmartScreen will likely warn on first run from another machine ("Windows protected your
PC" → "More info" → "Run anyway" to proceed). Also uses the default Electron icon, not a Nexus
one. Both cosmetic/trust issues, not functional ones — fine for personal/testing use, would need
fixing before handing this installer to someone else as "official."

**Update mechanism doesn't work from an installed build yet.** The update *check* works fine
(plain network request, confirmed showing "Up to date" correctly from the installed `Nexus.exe`)
— but clicking "Update" runs `git pull` against `app.getAppPath()`, which inside a packaged app
points at the bundled `resources/app.asar`, not a git checkout. It'll just fail. The update
*check* is genuinely useful as-is; the *apply* step still only works when running via
`npm run dev` from a real git clone. Real update-apply for an installed build needs
`electron-updater` wired to actual GitHub Releases — not built yet.

## Nav structure

See `docs/NAV_STRUCTURE.md` for the fixed v0.1 navigation and the reasoning behind it.

Nothing has been pulled back from the old build
(`C:\Users\leonc\Desktop\.Claude_Home_Local\Projects\Command Nexus`, repo
`LeonC-87/command-nexus`) — that repo is untouched. Data/features only come back here when
Leon explicitly asks for a specific piece.

See `G:\My Drive\.Nexus\README.md` for how this fits into the wider PC/laptop setup.
