---
capability: theme
tool: delta
os: windows, macos, linux
verified: 2026-11-23 (delta 0.21.2 on Windows 11: palette-style config loaded and rendered; also a working real-world config from a Windows setup)
sources: https://dandavison.github.io/delta/custom-themes.html, https://dandavison.github.io/delta/features-named-groups-of-settings.html, https://dandavison.github.io/delta/configuration.html
---
# Theme delta from the look-spec palette

delta has two color layers: `syntax-theme` (foreground token colors, a bat theme name) and diff styles (backgrounds, line numbers, file and hunk headers) set as hex. Syntax = `ansi` follows the terminal palette; diff backgrounds must be derived from the palette because they are blends, not palette entries.

## Config
Derive from tokens (blend 12 to 18 percent of the accent into `{palette.background}` for added/removed lines, 30 to 35 percent for the emphasized word):
- `derived.minusBg` = blend(`background`, `ansi.red`, 0.15); `derived.minusEmphBg` = blend(`background`, `ansi.red`, 0.35)
- `derived.plusBg` = blend(`background`, `ansi.green`, 0.15); `derived.plusEmphBg` = blend(`background`, `ansi.green`, 0.35)
```gitconfig
[delta]
    dark = true
    syntax-theme = ansi
    line-numbers = true
    file-style = bold "{palette.foreground}"
    file-decoration-style = "{palette.ansi.red}" ul
    hunk-header-style = file line-number syntax
    hunk-header-decoration-style = "{palette.ansi.brightBlack}" box
    hunk-header-file-style = "{palette.ansi.brightBlack}"
    hunk-header-line-number-style = "{palette.ansi.yellow}"
    minus-style = syntax "{derived.minusBg}"
    minus-emph-style = syntax "{derived.minusEmphBg}"
    minus-non-emph-style = syntax "{derived.minusBg}"
    plus-style = syntax "{derived.plusBg}"
    plus-emph-style = syntax "{derived.plusEmphBg}"
    plus-non-emph-style = syntax "{derived.plusBg}"
    line-numbers-minus-style = "{palette.ansi.red}"
    line-numbers-plus-style = "{palette.ansi.green}"
    line-numbers-zero-style = "{palette.ansi.brightBlack}"
    line-numbers-left-style = "{palette.ansi.brightBlack}"
    line-numbers-right-style = "{palette.ansi.brightBlack}"
    commit-decoration-style = "{palette.ansi.red}" box
    whitespace-error-style = "{palette.ansi.brightRed}" reverse
    zero-style = syntax
```
Put it in a named feature to switch looks (`features = my-look`, one `[delta "my-look"]` section) or in `~/.config/git/delta.gitconfig` included from `~/.gitconfig`.

Ready-made look: the delta repo ships `themes.gitconfig` (include it, then `features = <name>`; browse with `delta --show-themes`).

Custom syntax colors (your own bat `.tmTheme`): build it as in the bat theme recipe, then `syntax-theme = <name>`. Check `delta --list-syntax-themes` shows it.

## Notes
- Truecolor: with `COLORTERM` not `truecolor`/`24bit` delta converts hex to the 256-color cube (observed: `38;5;N`). Terminals that set it need nothing; otherwise add `true-color = always` to `[delta]` (option `--true-color <auto|always|never>`).
- Quote every style value in the gitconfig: `file-style = bold "#F2EEEA"` (docs: delta style values need double quotes). Theme names unquoted: `syntax-theme = Monokai Extended`.
- `syntax-theme = ansi` keeps syntax colors tied to the terminal's 16 colors; with a hex diff background it can lose contrast if the palette's `ansi.*` is dim. Verify with a real diff.
- `dark = true` / `light = true` choose delta's defaults when `syntax-theme` is not set and affect default diff colors.
- Selected-line and hyperlink styles: `hyperlinks = true` and `hyperlinks-file-link-format = "vscode://file/{path}:{line}"` make file names clickable in terminals with OSC 8.
- Check: `diff -u a b | delta --color-only | cat -v` shows the SGR codes; `delta --show-config` lists resolved styles.
