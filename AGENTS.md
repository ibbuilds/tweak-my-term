# AGENTS.md

Instructions for AI agents working in this repo, either **using** tweak-my-term to build
someone's terminal or **developing** it.

## Using it to build a terminal (any agent)

Follow `skills/setup/SKILL.md`: it is the full pipeline (detect → brief → inspire →
anchor → style → look.json → fit → preview → render → plan/approve/apply → verify →
measure → polish). Its `references/` hold the stage guides. Without the Claude Code
plugin, call the CLI as `node engine/cli.js <command>` (same as `tmt`). Requires Node 20+.

Hard rules:
- Never write a user's live config files directly. Draft in the run folder, `tmt stage`,
  `tmt plan`, show the plan, and only after the user says yes: `tmt approve <hash>`,
  `tmt apply`, `tmt verify`, `tmt measure`.
- Don't install anything the user didn't agree to.
- Free tools only: open source or free for any use. No paid, subscription or
  commercial-license tools in the catalog or in a build.
- Generated or user-owned images only; link third-party screenshots.
- Never print secrets found in config files.

## Developing it

- Layout: `engine/` (apply engine and CLI), `kit/` (images, color, palette, scenes,
  preview, inspiration search), `catalog/` (per-tool facts and recipes), `schemas/`,
  `skills/` + `agents/` + `hooks/` + `.claude-plugin/` (Claude Code plugin),
  `tools/catalog.js` (catalog checker and capability builder). See PLAN.md.
- Zero npm dependencies. CommonJS, `'use strict'`, Node 20+.
- Tests: `npm test` (node:test). `npm run check` adds the catalog check. Tests never
  touch the real home: set `TMT_HOME` to a temp folder (and `TMT_OS` to simulate an OS).
- Test-first for engine and kit behavior. Every catalog recipe needs frontmatter
  `capability, tool, os, verified, sources` and a reference from its `tool.json`;
  `verified.how` is `machine` only if you ran it.
- Cross-OS: code paths for Windows, macOS and Linux; paths through `engine/paths.js`
  tokens, processes through `engine/sys.js`.
- Commits: small, Conventional Commits. No personal data (usernames, machine names,
  emails, absolute local paths) in code, docs or fixtures.
