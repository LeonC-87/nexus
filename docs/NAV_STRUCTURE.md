# Nexus — Initial Nav Structure (decided 2026-08-25)

Settled by Leon, ahead of full IA discovery finishing in ChatGPT. Blank scaffold only — no
content, no stack chosen yet (waiting on the ChatGPT product-discovery conversation to land on
a tech stack before any code is written).

## Top-level nav

1. **Overview**
2. **Today**
3. **Inbox**
4. **Device**
5. **Security**
6. **Settings**

## Modules section (separate area within nav)

- **Personal** (Life)
- **Projects**

That's the full initial set — nothing else yet. None of these will contain the same
content/structure as old Command Nexus's equivalent pages; each gets defined from scratch as
Leon builds it piece by piece.

## Open requirement noted for architecture (not yet resolved)

Leon wants a **distributable "user copy"** of Nexus eventually — something that can be given or
sold to someone else, which they can **update** as Leon ships new versions. This needs to shape
the Core/module architecture from early on (e.g. no hardcoded personal data in Core, a real
update/versioning mechanism) even though the mechanism itself isn't designed yet. Flagged back
to the ChatGPT discovery thread — see `G:\My Drive\.Nexus\01_AI_TOOLS\` for that conversation
reference once the discovery concludes and gets written up.
