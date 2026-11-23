---
capability: theme
tool: fd
os: windows, macos, linux
verified: 2026-11-23 (fd 10.5.2 on Windows 11: LS_COLORS with 24-bit values produced 38;2;R;G;B output)
sources: https://github.com/sharkdp/fd#colorized-output, https://github.com/sharkdp/vivid
---
# Color fd results from the palette (LS_COLORS)

fd has no theme file. It colors paths with the standard `LS_COLORS` environment variable (directories, extensions, executables). The same variable colors GNU `ls`, eza and zsh/bash completion, so one string themes all of them.

## Config
`LS_COLORS` is `key=SGR` pairs separated by `:`. Keys: `di` directory, `ln` symlink, `ex` executable, `fi` file, `pi` pipe, `so` socket, `bd`/`cd` devices, `or` orphan link, `*.ext` glob. 24-bit SGR is `38;2;R;G;B`; bold prefix `1;`. Build it from the palette (convert each `{palette.*}` hex to decimal RGB):
```sh
export LS_COLORS="rs=0:di=1;38;2;{R};{G};{B}:ln=38;2;...:ex=38;2;...:*.md=38;2;...:*.json=38;2;...:*.rs=38;2;...:*.zip=38;2;..."
# di -> palette.ansi.blue   ln -> palette.ansi.cyan   ex -> palette.ansi.green
# *.md *.txt -> palette.foreground   archives (*.zip *.tar *.gz) -> palette.ansi.red
# source (*.rs *.py *.js *.ts *.go) -> palette.ansi.yellow   images -> palette.ansi.magenta
```
Windows (PowerShell, persisted for the user):
```powershell
[Environment]::SetEnvironmentVariable('LS_COLORS', 'rs=0:di=1;38;2;94;113;134:ex=38;2;127;145;114', 'User')
```
ANSI-only form that follows the terminal palette automatically: `LS_COLORS="di=1;34:ln=36:ex=32:*.zip=31"` (SGR 30-37 normal, 90-97 bright).
Generator: `vivid` (https://github.com/sharkdp/vivid) ships LS_COLORS themes: `export LS_COLORS="$(vivid generate <theme>)"`.
Disable color: `NO_COLOR=1` or `--color never`; force: `--color always`.

## Notes
- Verified: `LS_COLORS="*.rs=38;2;224;32;30:di=38;2;94;113;134" fd --color=always . dir` printed the directory and `x.rs` with those RGB sequences.
- If paths come out uncolored on Windows, LS_COLORS is unset (README: it is not set there by default) or output is piped (fd auto-disables color when piped; use `--color always` inside fzf `--ansi` pipelines).
- Setting a truecolor LS_COLORS also masks eza's `theme.yml` (observed: env vars override the file); keep both in sync or unset LS_COLORS for eza.
- Terminals without truecolor need 256-color codes (`38;5;N`).
