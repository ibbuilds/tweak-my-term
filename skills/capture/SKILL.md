---
name: capture
description: Read the user's current terminal setup (terminal, shell rc files, prompt, colors, font, tools) into a tweak-my-term look spec, read-only, so it can be backed up, shared, ported to another OS or used as a starting point. Use when the user wants to save, export, document, port or copy their current terminal setup.
---

# Capture the current setup

Nothing is written outside the run folder.

1. `tmt new --note "capture"`, `tmt detect`, `tmt capture` (copies known config files into
   `<run>/captured/<tool>/`).
2. Read the captured configs. Extract: palette (scheme in the terminal config, prompt
   colors), font face and size, background image and opacity, padding, cursor, prompt
   tool and layout, shells, CLI tools and their theme settings.
3. Write `<run>/look.json` following `${CLAUDE_PLUGIN_ROOT}/schemas/look.schema.json`, then
   `tmt look check <run>/look.json`. Copy referenced images next to it.
4. Show the user a summary and, if useful,
   `tmt art preview <run>/look.json --out <run>/preview.html`. Never print secrets found in
   rc files (tokens, keys, passwords): say they exist and were left out.
5. To recreate it on another machine or OS, continue with the `setup` skill there using
   this look.json as the spec.
