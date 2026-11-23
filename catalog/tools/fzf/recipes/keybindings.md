---
capability: keybindings
tool: fzf
os: windows, macos, linux
verified: 2026-11-23 (docs, fzf 0.75.0 README and man page)
sources: https://github.com/junegunn/fzf#key-bindings-for-command-line, https://github.com/junegunn/fzf/blob/master/man/man1/fzf.1
---
# fzf key bindings: shell widgets and in-picker keys

Two layers: the shell widgets that open fzf (set by the init) and the keys inside the picker (`--bind`).

## Config
Shell widgets (bash, zsh, fish; PSFzf chords for PowerShell):

| Key | Action |
|---|---|
| Ctrl-T | paste selected paths on the command line |
| Ctrl-R | paste selected history entry |
| Alt-C | cd into the selected directory |
| `**` then Tab | fuzzy completion for paths, `kill`, `ssh`, env vars |

Change or remove a widget: disable the default and bind your own key to the widget function the init defines, or disable one with `FZF_CTRL_T_COMMAND= eval "$(fzf --bash)"`.

PowerShell:
```powershell
Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+f' -PSReadlineChordReverseHistory 'Ctrl+r'
```
Inside the picker, add or change keys with `--bind` (comma separated), in `FZF_DEFAULT_OPTS` or a per-widget `*_OPTS`:
```sh
export FZF_DEFAULT_OPTS="$FZF_DEFAULT_OPTS --bind=ctrl-/:toggle-preview,ctrl-u:preview-half-page-up,ctrl-d:preview-half-page-down,alt-j:down,alt-k:up,tab:toggle+down,shift-tab:toggle+up"
```

## Notes
- Defaults inside the picker: Ctrl-J/Ctrl-N down, Ctrl-K/Ctrl-P up, Tab/Shift-Tab multi-select (with `-m`), Enter accept, Esc/Ctrl-C abort. List: `man fzf` "AVAILABLE KEYS" and "AVAILABLE ACTIONS".
- Alt-C needs the terminal to send Alt as Esc-prefix: macOS Terminal.app needs "Use Option as Meta key", iTerm2 needs Left Option = Esc+ (terminal settings, not fzf).
- PSFzf (README): Ctrl+t provider paths, Alt+c cd (override with `Set-PsFzfOption -AltCCommand`), Alt+a history arguments; `-PSReadlineChordProvider` and `-PSReadlineChordReverseHistory` set the chords.
