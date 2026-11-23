---
capability: config
tool: lazygit
os: windows, macos, linux
verified: 2026-11-23 (docs Config.md for 0.66.3; the same keys are used by a working Windows 11 config)
sources: https://github.com/jesseduffield/lazygit/blob/master/docs/Config.md
---
# lazygit config.yml: layout and behavior

One YAML file with sections `gui`, `git`, `os`, `keybinding`, `update`, `refresher`. Print the annotated defaults with `lazygit --config`; only write the keys you change.

## Config
```yaml
gui:
  border: single               # rounded (default) | single | double | hidden | bold
  nerdFontsVersion: "3"        # '2' | '3' | '' (no icons)
  showFileIcons: true
  showRandomTip: false
  showCommandLog: false
  showBottomLine: true         # key-hint line
  sidePanelWidth: 0.3333
  expandFocusedSidePanel: false
  showFileTree: true
  mouseEvents: true
  commitHashLength: 8
  statusPanelView: dashboard
  language: auto
disableStartupPopups: true
git:
  diffRenderers:
    - command: delta --dark --paging=never
os:
  editPreset: vscode
```
Default config dir: see `install-init.md`; repo-level override in `<repo>/.git/lazygit.yml`. Merge several files: `LG_CONFIG_FILE="$HOME/.base.yml,$HOME/.theme.yml" lazygit`. Change the config directory with `CONFIG_DIR`.

## Notes
- `disableStartupPopups: true` hides the update/news popups (top-level key).
- `update.method` and `git.autoFetch` are other noise sources if the user wants a quiet UI (see `lazygit --config`).
- Config changes apply on the next launch; there is no live reload.
- Verify: `lazygit --print-config-dir`, then start `lazygit` in a repo; a bad key prints an error and exits.
