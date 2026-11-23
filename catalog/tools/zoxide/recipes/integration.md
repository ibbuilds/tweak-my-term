---
capability: integration
tool: zoxide
os: windows, macos, linux
verified: 2026-11-23 (docs; PowerShell `--cmd cd` output inspected on zoxide 0.10.0)
sources: https://github.com/ajeetdsouza/zoxide#configuration, https://github.com/ajeetdsouza/zoxide#installation
---
# Make zoxide replace cd and feed other tools

`zoxide init <shell> --cmd <name>` changes the command prefix. `--cmd cd` replaces `cd` (and adds `cdi`), so the habit stays and every `cd` teaches the database.

## Config
```sh
eval "$(zoxide init bash --cmd cd)"      # also zsh; fish: zoxide init fish --cmd cd | source
```
```powershell
Invoke-Expression (& { (zoxide init powershell --cmd cd | Out-String) })
# defines Set-Alias cd -> __zoxide_z and cdi -> __zoxide_zi (verified)
```
Interactive picker uses fzf (min fzf 0.51.0). Color and layout it with fzf's own options:
```sh
export _ZO_FZF_OPTS="--height=40% --layout=reverse --border"
```
Query from scripts and other tools:
```sh
zoxide query --list            # all entries, best first
zoxide query myproj            # best match path
zoxide add ~/work/new-project  # register without visiting
```
Keep the home directory out of results (default `_ZO_EXCLUDE_DIRS="$HOME"`), and add noise to exclude:
```sh
export _ZO_EXCLUDE_DIRS="$HOME:$HOME/.cache/*:/tmp/*"   # Windows uses ';' as separator
```

## Notes
- `--cmd cd` shadows the builtin in interactive shells (README: `--cmd cd` replaces the cd command). Keep it out of non-interactive rc paths, and expect scripts you source interactively to call zoxide.
- `--no-cmd` defines only `__zoxide_z`/`__zoxide_zi` so you can bind your own names.
- Set `_ZO_*` variables before the init line; they are read at init time.
- `zi` needs fzf (README: minimum 0.51.0).
- yazi lists zoxide and fzf as optional dependencies for directory jumping (yazi docs); see its entry.
