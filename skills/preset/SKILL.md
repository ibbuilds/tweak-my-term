---
name: preset
description: Apply a ready-made, tested terminal look (a tweak-my-term preset such as Eclipse) with a diff, approval, verification and undo. Use when the user asks for a preset, a ready-made theme, "the Eclipse look", or a quick known-good setup.
argument-hint: "[preset name]"
---

# Apply a preset

Preset: $ARGUMENTS

1. `tmt preset list`. No name given: show the list (name, OSes, description) with each
   preset's `screenshot.png` path and let the user choose.
2. `tmt status`, then `tmt new --note "preset <name>"` and `tmt detect`.
3. `tmt stage preset <name>`. If the preset has no version for this OS, say so and build
   it with the `setup` skill using `presets/<name>/look.json` as the look spec.
4. `tmt measure --before`, then `tmt plan`. Show the user the plan: files created and
   changed (their own lines in rc files are kept; only marked blocks change), installs,
   fonts.
5. After a clear yes: `tmt approve <hash>`, `tmt apply` (add `--allow-installs` only if
   the user agreed to installs), `tmt verify`, `tmt measure`.
6. Ask the user to open a new terminal window; offer `tmt shot` to check it. Give the undo
   command: `tmt restore <run-id>`.
