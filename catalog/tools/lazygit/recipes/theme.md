---
capability: theme
tool: lazygit
os: windows, macos, linux
verified: 2026-11-23 (docs Config.md for 0.66.3; the structure matches a working Windows 11 config)
sources: https://github.com/jesseduffield/lazygit/blob/master/docs/Config.md#color-attributes, https://github.com/jesseduffield/lazygit/blob/master/docs/Config.md#themes-for-dark-and-light-backgrounds
---
# Theme lazygit from the look-spec palette

Colors live in `gui.theme` as lists of one color plus optional modifiers: a name (`black red green yellow blue magenta cyan white default`) or a quoted hex, and modifiers `bold dim reverse underline strikethrough`.

## Config
```yaml
gui:
  border: single                 # rounded (default) | single | double | hidden | bold
  nerdFontsVersion: "3"          # needs a Nerd Font, empty string = no icons
  showRandomTip: false
  theme:
    activeBorderColor: ["{palette.ansi.red}", bold]
    inactiveBorderColor: ["{palette.ansi.brightBlack}"]
    searchingActiveBorderColor: ["{palette.ansi.yellow}", bold]
    optionsTextColor: ["{palette.ansi.brightBlack}"]
    selectedLineBgColor: ["{palette.selectionBackground}"]
    inactiveViewSelectedLineBgColor: ["{palette.background}"]
    cherryPickedCommitFgColor: ["{palette.ansi.brightWhite}"]
    cherryPickedCommitBgColor: ["{palette.ansi.red}"]
    markedBaseCommitFgColor: ["{palette.ansi.brightWhite}"]
    markedBaseCommitBgColor: ["{palette.ansi.brightBlack}"]
    unstagedChangesColor: ["{palette.ansi.red}"]
    defaultFgColor: ["{palette.foreground}"]
    authorColors:
      "*": "{palette.ansi.brightBlack}"
```
Terminal-following (no hex): `activeBorderColor: [red, bold]`, `inactiveBorderColor: [default]`, `selectedLineBgColor: [default]` (bold line) or `[reverse]`.
Light/dark variants: `gui.colorScheme: auto|dark|light`, then override per scheme in `gui.darkTheme` / `gui.lightTheme` (same fields as `theme`):
```yaml
gui:
  colorScheme: auto
  lightTheme:
    selectedLineBgColor: ["{palette.ansi.brightWhite}"]
```
Per-branch and per-author colors: `gui.theme.branchColorPatterns: { "^feature/": "{palette.ansi.cyan}" }` and `authorColors: { "Jane Doe": "{palette.ansi.magenta}" }` (docs: custom author/branch color).

## Notes
- Keys are case-sensitive and a typo is an error on start; run `lazygit` once after writing to confirm it opens. The default `selectedLineBgColor` is blue on dark terminals if left empty.
- Use `selectedLineBgColor` (not `selectedLineFgColor`) for the highlight bar: it needs contrast against `defaultFgColor` text of at least 4.5:1, or selected rows are unreadable.
- Hex colors need a truecolor terminal; on 256-color terminals lazygit approximates.
- Existing themes: https://github.com/catppuccin/lazygit and others, as `config.yml` fragments that can be merged via `LG_CONFIG_FILE`.
- Diff colors come from the diff renderer (delta/git), not from `gui.theme` (see `integration.md`).
