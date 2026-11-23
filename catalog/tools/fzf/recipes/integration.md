---
capability: integration
tool: fzf
os: windows, macos, linux
verified: 2026-11-23 (docs; the bash form is the one used in the Eclipse preset on a Windows 11 machine)
sources: https://github.com/junegunn/fzf#environment-variables, https://github.com/junegunn/fzf#fuzzy-completion-for-bash-and-zsh, https://github.com/junegunn/fzf#key-bindings-for-command-line
---
# Make fzf use fd, preview with bat and eza

fzf lists files with its built-in walker. Point it at `fd` (respects .gitignore, fast, hidden files on request) and give each widget a preview. Set these before the shell init line so the widgets pick them up.

## Config
bash / zsh (put before `eval "$(fzf --bash)"` / `source <(fzf --zsh)`):
```sh
_fd_excl='--exclude .git --exclude node_modules --exclude target --exclude dist'
export FZF_DEFAULT_COMMAND="fd --type f --hidden --follow $_fd_excl"
export FZF_CTRL_T_COMMAND="fd --hidden --follow $_fd_excl"
export FZF_ALT_C_COMMAND="fd --type d --hidden --follow $_fd_excl"
export FZF_CTRL_T_OPTS="--preview-window='right,60%,border-left' --preview='[[ -d {} ]] && eza --tree --level=2 --color=always --icons=always {} || bat --color=always --style=numbers --line-range=:300 {}'"
export FZF_ALT_C_OPTS="--preview='eza --tree --level=2 --color=always --icons=always {}'"
export FZF_CTRL_R_OPTS="--preview='echo {2..}' --preview-window='down,3,wrap,hidden' --bind='ctrl-/:toggle-preview'"
# ** completion uses these to list candidates
_fzf_compgen_path() { fd --hidden --follow --exclude .git . "$1"; }
_fzf_compgen_dir()  { fd --type d --hidden --follow --exclude .git . "$1"; }
unset _fd_excl
```
fish: `set -gx FZF_DEFAULT_COMMAND "fd --type f --hidden --follow --exclude .git"` and `set -gx FZF_CTRL_T_OPTS "--preview 'bat --color=always --style=numbers --line-range=:300 {}'"` before `fzf --fish | source`.

PowerShell with PSFzf:
```powershell
$env:FZF_DEFAULT_COMMAND = 'fd --type f --hidden --follow --exclude .git'
Set-PsFzfOption -PSReadlineChordProvider 'Ctrl+t' -PSReadlineChordReverseHistory 'Ctrl+r' -EnableAliasFuzzyEdit
```
Linux Debian/Ubuntu: the binaries are `fdfind` and `batcat`; create `fd`/`bat` symlinks in `~/.local/bin` (see those tools) or use the real names in the lines above.

## Notes
- `--walker`, `--walker-root`, `--walker-skip` in `FZF_DEFAULT_OPTS` replace the external `fd` call entirely (README); use them when fd is not installed: `--walker=file,dir,follow,hidden --walker-skip=.git,node_modules,target`.
- `{}` in `--preview` is the single-quoted current item; on Windows Git Bash use forward slashes. Do not put `--preview` in `FZF_DEFAULT_OPTS` globally (README warns it slows every call); use the per-widget `*_OPTS`.
- Preview needs `bat` and `eza` installed; guard with `command -v` if a preset might lack them. `--icons=always` in the preview needs a Nerd Font (see the nerd-fonts entry).
- For clipboard in history: on WSL/Git Bash `clip.exe` (Windows), macOS `pbcopy`, Linux `xclip -selection clipboard`/`wl-copy`, e.g. `--bind='ctrl-y:execute-silent(echo -n {2..} | pbcopy)+abort'`.
- zoxide's interactive picker (`zi`) also uses fzf; tune it with `_ZO_FZF_OPTS`.
