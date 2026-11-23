---
capability: theme
tool: fzf
os: windows, macos, linux
verified: 2026-11-23 (docs, fzf 0.75.0 man page)
sources: https://github.com/junegunn/fzf/blob/master/man/man1/fzf.1, https://github.com/junegunn/fzf#environment-variables
---
# Theme fzf from the look-spec palette

fzf colors are one `--color` option: a base scheme (`dark`, `light`, `base16`, `bw`) followed by `name:color` overrides. Colors are `#rrggbb`, 0-255, ANSI names (`red`, `bright-black`) or `-1` (terminal default). Set it in `FZF_DEFAULT_OPTS` or an options file.

## Config
Exact hex, from the palette tokens:
```sh
export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS \
  --color=bg:{palette.background},bg+:{palette.selectionBackground},fg:{palette.foreground},fg+:{palette.ansi.brightWhite} \
  --color=hl:{palette.ansi.yellow},hl+:{palette.ansi.brightYellow},info:{palette.ansi.brightBlack},border:{palette.ansi.brightBlack} \
  --color=prompt:{palette.ansi.red},pointer:{palette.ansi.red},marker:{palette.ansi.green},spinner:{palette.ansi.cyan} \
  --color=header:{palette.ansi.brightBlack},gutter:{palette.background},label:{palette.ansi.brightBlack},query:{palette.foreground}"
```
Terminal-following (no hex, survives palette changes and light/dark switches):
```sh
export FZF_DEFAULT_OPTS="--color=base16,bg:-1,bg+:bright-black,hl:yellow,hl+:bright-yellow,pointer:red,marker:green,prompt:red,info:bright-black,border:bright-black,gutter:-1"
```
In an options file (one option per line, `#` comments; set `FZF_DEFAULT_OPTS_FILE=~/.config/fzf/fzfrc`):
```
--color=bg:{palette.background},bg+:{palette.selectionBackground},fg:{palette.foreground}
--color=hl:{palette.ansi.yellow},hl+:{palette.ansi.brightYellow},prompt:{palette.ansi.red},pointer:{palette.ansi.red}
```
PowerShell (PSFzf reads the same variable):
```powershell
$env:FZF_DEFAULT_OPTS = '--color=bg:{palette.background},bg+:{palette.selectionBackground},fg:{palette.foreground},hl:{palette.ansi.yellow},prompt:{palette.ansi.red},pointer:{palette.ansi.red}'
```

## Notes
- Color names (man page): `fg bg hl fg+ bg+ hl+ info border prompt pointer marker spinner header gutter label query separator scrollbar preview-fg preview-bg list-bg input-bg header-bg footer-bg` and more; `bg:-1` keeps the terminal background (needed for transparent terminals).
- Use `bg+` (current line) distinct from `bg` by at least 1.3:1 contrast or the cursor line disappears. `selectionBackground` usually works.
- Attributes can be appended: `hl:{palette.ansi.yellow}:bold`, `info:{palette.ansi.brightBlack}:italic`.
- `--style=full` (or `minimal`, `default`) is a layout preset, not a color theme; `--style=full --color=...` combines them.
- Env vars set in the user environment also color zoxide's picker (`_ZO_FZF_OPTS`) and yazi's fzf jump; they do not color the bat preview (that is bat's theme).
- Check: `echo a b | tr ' ' '\n' | fzf --color=...` in the target terminal.
