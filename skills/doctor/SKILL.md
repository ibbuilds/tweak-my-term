---
name: doctor
description: Diagnose terminal problems read-only - slow shell startup, broken or missing icons (boxes instead of glyphs), wrong or washed-out colors, prompt glitches, config errors, a failed tweak-my-term run. Use when the user says their terminal or shell is slow, broken, ugly, shows squares or question marks, or a previous setup went wrong.
argument-hint: "[symptom]"
---

# Terminal doctor (read-only)

Symptom: $ARGUMENTS

Change nothing here. Propose a fix and, if the user agrees, do it as a run with the
`setup` flow. For a broad audit, delegate to the `terminal-auditor` subagent.

1. `tmt status`: an unfinished or failed run is often the answer (`tmt restore` undoes it).
2. `tmt detect`: versions, fonts, configs present.
3. By symptom:
   - **Slow startup**: `tmt measure --before --runs 5`. Then bisect: time the shell with
     no profile (`bash --norc -i -c exit`, `powershell -NoProfile -Command exit`), then
     source the rc pieces one by one. Usual causes: framework loaders (oh-my-zsh, nvm,
     conda init), uncached prompt init, `compinit` without a cache, module imports in
     `$PROFILE`, antivirus scanning the profile folder.
   - **Boxes or `?` instead of icons**: the terminal font isn't a Nerd Font and has no
     Symbols Nerd Font fallback. Compare the font face in the terminal config with the
     installed fonts.
   - **Wrong colors**: a profile overriding the default scheme, `TERM`/`COLORTERM` not
     truecolor, a tool's own theme ignoring the palette, `$PSStyle`/PSReadLine colors.
   - **Config errors**: run the tool's validate command (`tmt catalog show <id>`).
4. Report the cause with evidence, the fix, and the expected gain. Offer to apply it.
