---
capability: keybindings
tool: lazygit
os: windows, macos, linux
verified: 2026-11-23 (docs Config.md keybinding section, lazygit 0.66.3)
sources: https://github.com/jesseduffield/lazygit/blob/master/docs/Config.md#keybindings, https://github.com/jesseduffield/lazygit/blob/master/docs/keybindings
---
# Change lazygit keybindings

Keys are set under `keybinding:` in `config.yml`, grouped by view (`universal`, `files`, `branches`, `commits`, ...). A value is a key string or a list of keys; special keys use angle brackets (`<c-r>` style names are written as in the shipped config: `<ctrl+c>`, `<esc>`, `<tab>`, `<up>`, `<enter>`).

## Config
Inspect the defaults for the installed version first: `lazygit --config` prints the full default config including every `keybinding` entry.
```yaml
keybinding:
  universal:
    quit: [q, <ctrl+c>]
    prevItem: [<up>, k]
    nextItem: [<down>, j]
    prevPage: ','
    nextPage: .
    undo: z
    redo: Z
    cycleDiffRenderers: '|'
    cycleDiffRenderersReverse: \
    openRecentRepos: <ctrl+r>
  files:
    commitChanges: c
```
Only list what you change; unspecified keys keep the defaults. Per-context cheat sheets for each version: the `docs/keybindings` folder in the repo, also `?` inside lazygit.
Custom commands bound to a key (shell command per keypress) live in `customCommands`; they run arbitrary commands, so review them like scripts.

## Notes
- Copy the key-name style printed by `lazygit --config` for the installed version (0.66.3 uses `<ctrl+c>`, `<esc>`).
- Letters are case-sensitive (`Z` is shift+z). Terminals that cannot send a combo (e.g. Ctrl+Shift) cannot be bound.
- Verify by pressing `?` in the target view; it lists the active bindings.
