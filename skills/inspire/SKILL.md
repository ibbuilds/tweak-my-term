---
name: inspire
description: Find terminal looks to copy - searches 4,000+ r/unixporn rices (screenshots + dotfiles repos) by mood, color scheme, terminal, shell or OS and shows a short list to pick from. Use when the user wants terminal or dotfiles inspiration, ideas, examples, "show me options", or doesn't know what look they want.
argument-hint: "[mood, scheme, terminal or tool words]"
---

# Inspiration

Query: $ARGUMENTS

1. `tmt detect` (skip if already done this session) to know the OS, terminal and shells.
2. `tmt inspire $ARGUMENTS --os <os> --limit 6`. With no query, `tmt inspire --facets`
   shows common schemes and terminals to suggest from. For deeper research (opening
   repos, reading their configs) delegate to the `inspiration-scout` subagent.
3. Show 3-6 candidates as a numbered list: title, screenshot link, color scheme, terminal +
   prompt + tools, and one line on what transfers to the user's OS. Most rices are Linux:
   colors, prompt, fonts and fetch art transfer to Windows and macOS; window-manager
   layout, bars and compositor effects don't.
4. When the user picks one, continue with the `setup` skill using it as the anchor:
   `tmt inspire --save <n> <run-folder>` saves its screenshot locally.

Screenshots are linked, not rehosted. Data: awesome-dotfiles (r/unixporn).
