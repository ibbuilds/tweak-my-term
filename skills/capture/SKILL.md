---
name: capture
description: Read the user's current terminal setup (terminal, shell rc files, prompt, colors, font, tools) into a tweak-my-term look spec, read-only, so it can be backed up, shared, ported to another OS, audited or used as a starting point. Use when the user wants to save, export, document, port, copy or review their current terminal setup ("what's wrong with my terminal", "rate my setup").
---

# Capture the current setup

Nothing is written outside the run folder.

1. `tmt new --note "capture"`, `tmt detect`, `tmt capture`: copies known config files into
   `<run>/captured/<tool>/` (and the files rc files source, under `sourced/`), and reads
   today's look into `<run>/current.json` (scheme colors, font, padding, opacity,
   background, shader, startup panes, prompt per shell, fetch, multiplexer). History,
   databases, secrets and font folders are never copied.
2. `tmt audit`: `<run>/audit.md` lists what to keep, improve or add, by the design rules.
   Show it when the user asked for a review.
3. Fill the gaps `current.json` can't see (a named scheme defined elsewhere: import it with
   `tmt art scheme <file>`; prompt colors) by reading the captured files.
4. Write `<run>/look.json` following `${CLAUDE_PLUGIN_ROOT}/schemas/look.schema.json`, then
   `tmt look check <run>/look.json`. Copy referenced images next to it.
5. Show the user a summary and, if useful,
   `tmt art preview <run>/look.json --out <run>/preview.html`. Never print secrets found in
   rc files (tokens, keys, passwords): say they exist and were left out.
6. To recreate it on another machine or OS, or to improve it, continue with the `setup`
   skill using this look.json and audit.md.
