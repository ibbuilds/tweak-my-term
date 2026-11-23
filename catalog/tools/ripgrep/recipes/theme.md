---
capability: theme
tool: ripgrep
os: windows, macos, linux
verified: 2026-11-23 (rg 15.2.0 on Windows 11: --colors with r,g,b produced 38;2;R;G;B)
sources: https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md#colors, rg --help (--colors)
---
# Color ripgrep from the look-spec palette

ripgrep colors four things: file `path`, `line` number, `column` number, matched text `match`, plus `highlight` (the matching line, off by default). Each takes `fg`, `bg` and `style` settings, applied in order.

## Config
Spec format `TYPE:ATTRIBUTE:VALUE`. Values: `red blue green cyan magenta yellow white black`, `0` to `255`, or `r,g,b` in decimal or `0x` hex (help text). Styles: `bold nobold intense nointense underline nounderline italic noitalic`.
```
# ~/.ripgreprc
--colors=path:fg:{palette.ansi.magenta}
--colors=path:style:bold
--colors=line:fg:{palette.ansi.brightBlack}
--colors=column:fg:{palette.ansi.brightBlack}
--colors=match:fg:{palette.ansi.brightRed}
--colors=match:style:bold
```
With hex tokens converted to the `r,g,b` form, for example `--colors=match:fg:224,32,30`. Or follow the terminal palette: `--colors=path:fg:magenta --colors=match:fg:red --colors=line:fg:cyan`.
Reset a type first when a config is layered: `--colors=match:none`.
Enable the file:
```sh
export RIPGREP_CONFIG_PATH="$HOME/.ripgreprc"                         # bash/zsh
```
```powershell
[Environment]::SetEnvironmentVariable('RIPGREP_CONFIG_PATH', "$HOME\.ripgreprc", 'User')
```

## Notes
- Named colors use the terminal's ANSI palette; `r,g,b` needs a truecolor terminal (Windows Terminal, WezTerm, kitty, Ghostty, iTerm2). rg 15.2.0 printed `38;2;224;32;30` for `--colors 'match:fg:0xe0,0x20,0x1e'` (tested), not a 256-color approximation.
- One flag per line, no spaces around `=`; a value on the next line also works (GUIDE). Do not quote values in the config file.
- `rg --no-config` ignores the file; use it to debug.
- Matches inside `--heading` output use the same `path` style. `--pretty` is shorthand for `--color always --heading --line-number`.
- If the terminal draws the match in a color close to the background (low-contrast palette entries), use `match:bg` plus a contrasting `fg`, e.g. `--colors=match:bg:{palette.ansi.yellow} --colors=match:fg:{palette.background}`.
- Piped output is not colored unless `--color always` (needed for fzf `--ansi` pipelines).
