---
capability: integration
tool: lazygit
os: windows, macos, linux
verified: 2026-11-23 (docs; delta renderer and Nerd Font settings from a working Windows 11 config; lazygit 0.66.3)
sources: https://github.com/jesseduffield/lazygit/blob/master/docs/Custom_DiffRenderers.md, https://github.com/jesseduffield/lazygit/blob/master/docs/Config.md
---
# Wire lazygit to delta, your editor and Nerd Font icons

## Config
`config.yml`:
```yaml
gui:
  nerdFontsVersion: "3"          # icons need a Nerd Font (see nerd-fonts entry)
  showFileIcons: true
git:
  diffRenderers:
    - command: delta --dark --paging=never
      name: delta
    - command: delta --dark --paging=never --side-by-side -w={{columnWidth}}   # cycle with the | key
      name: delta side-by-side
os:
  editPreset: vscode             # see presets below
```
`{{width}}`, `{{columnWidth}}`, `{{colorScheme}}` (`dark`/`light`) are available in the renderer command (docs). Diff renderers are cycled with `|` and `\` (default keys `cycleDiffRenderers`, `cycleDiffRenderersReverse`).
Presets: `vim nvim nvim-remote lvim emacs nano micro vscode sublime bbedit kakoune helix xcode zed acme`; custom commands: `os.edit: 'myeditor {{filename}}'`, `os.editAtLine: 'myeditor --line={{line}} {{filename}}'`, `os.editAtLineAndWait` (docs). Lazygit guesses the preset from `git config core.editor`, `$VISUAL` or `$EDITOR` when none is set.
Shell alias: `alias lg=lazygit`; PowerShell `function lg { lazygit @args }`.
Change shell directory on exit (repo switches): README documents an `lg` wrapper using `LAZYGIT_NEW_DIR_FILE`; see https://github.com/jesseduffield/lazygit#changing-directory-on-exit.

## Notes
- `delta` must be on PATH for lazygit's process; on Windows set it in the user environment, not only in a shell rc.
- `--paging=never` is required inside lazygit (it has its own scrolling).
- `os.editPreset` sets edit, editAtLine, editAtLineAndWait and openDirInEditor together (docs). Unset it to use your own commands.
- Delta's own colors: see the delta theme recipe; its `syntax-theme = ansi` keeps diffs consistent with the lazygit theme.
