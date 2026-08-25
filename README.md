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

`npm install` triggers a `postinstall` step (`electron-builder install-app-deps`) that rebuilds
`better-sqlite3`'s native binding against Electron's ABI — required because it's a compiled
module, not pure JS.

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

On startup, Nexus compares its local `package.json` version against the version on the
`main` branch of `LeonC-87/nexus` (via `gh api repos/LeonC-87/nexus/contents/package.json`).
If newer, a badge appears under the Nexus logo in the sidebar and a card appears in
Settings > General with an "Update" button.

**This is a placeholder, not the real distributable updater.** It shells out to the `gh` CLI
(already authenticated on this machine) rather than embedding any credential, and "updating"
currently means `git pull && npm install` in the app's own directory followed by a relaunch —
correct for the current git-clone-and-`npm run dev` stage, but it assumes a local git checkout
and an authenticated `gh` CLI, both very much "this is Leon's machine" assumptions. **This must
be replaced with a real electron-builder/electron-updater release-based flow before Nexus is
ever given to another user** — see `src/main/update.ts` for the explicit note.

## Nav structure

See `docs/NAV_STRUCTURE.md` for the fixed v0.1 navigation and the reasoning behind it.

Nothing has been pulled back from the old build
(`C:\Users\leonc\Desktop\.Claude_Home_Local\Projects\Command Nexus`, repo
`LeonC-87/command-nexus`) — that repo is untouched. Data/features only come back here when
Leon explicitly asks for a specific piece.

See `G:\My Drive\.Nexus\README.md` for how this fits into the wider PC/laptop setup.
