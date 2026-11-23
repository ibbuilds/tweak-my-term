---
capability: config
tool: zoxide
os: windows, macos, linux
verified: 2026-11-23 (docs, zoxide 0.10.0 README)
sources: https://github.com/ajeetdsouza/zoxide#configuration
---
# zoxide configuration: flags and environment variables

zoxide has no config file. Behavior comes from `zoxide init` flags and `_ZO_*` environment variables, which must be set before `zoxide init` runs.

## Config
Init flags:

| Flag | Meaning |
|---|---|
| `--cmd <prefix>` | command prefix: `j` gives `j`/`ji`; `cd` replaces cd |
| `--hook none\|prompt\|pwd` | when a directory score is incremented (default `pwd`) |
| `--no-cmd` | do not define `z`/`zi`, only `__zoxide_z`/`__zoxide_zi` |

Environment variables (README):

| Variable | Meaning |
|---|---|
| `_ZO_DATA_DIR` | database dir; default Linux `$XDG_DATA_HOME/zoxide` or `~/.local/share/zoxide`, macOS `~/Library/Application Support/zoxide`, Windows `%LOCALAPPDATA%\zoxide` |
| `_ZO_ECHO=1` | print the matched directory before jumping |
| `_ZO_EXCLUDE_DIRS` | globs not stored, separated by `:` (Linux/macOS) or `;` (Windows); default `$HOME` |
| `_ZO_FZF_OPTS` | extra options for the `zi` fzf picker |
| `_ZO_MAXAGE` | aging limit, default 10000 entries |
| `_ZO_RESOLVE_SYMLINKS=1` | store the resolved path |

```sh
export _ZO_ECHO=1
export _ZO_EXCLUDE_DIRS="$HOME:$HOME/.cache/*"
eval "$(zoxide init bash --cmd cd)"
```
```powershell
$env:_ZO_ECHO = '1'
Invoke-Expression (& { (zoxide init powershell | Out-String) })
```

## Notes
- The database lives outside dotfiles; do not commit it. Back it up with the data dir if learned history matters to the user (restoring a look should not wipe it: the engine never touches `_ZO_DATA_DIR`).
- On Windows set `_ZO_*` as user environment variables or in `$PROFILE` before the init line.
- Verify: `zoxide query --list` prints scored paths; `zoxide init bash | head -5` shows the generated script.
