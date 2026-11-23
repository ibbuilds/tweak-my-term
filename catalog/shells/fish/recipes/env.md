---
capability: env
tool: fish
os: macos, linux
verified: 2026-11-23 (docs, fish 4.9.3 `fish_add_path`, tutorial and language docs)
sources: https://fishshell.com/docs/current/cmds/fish_add_path.html, https://fishshell.com/docs/current/tutorial.html, https://fishshell.com/docs/current/language.html
---
# Environment variables and PATH in fish
Use `set -gx NAME value` (global, exported) in `config.fish`, or `set -Ux` (universal, exported, persists across sessions). `$PATH` is a list; manage it with `fish_add_path`.

## Config
```fish
set -gx EDITOR nvim
set -gx PAGER less
set -gx LESS '-R -F'

fish_add_path ~/.local/bin ~/bin                  # persistent, no duplicates, prepends by default
fish_add_path --append /opt/tools/bin             # append instead
# Homebrew (macOS Apple Silicon)
test -x /opt/homebrew/bin/brew; and /opt/homebrew/bin/brew shellenv | source
```
One-time persistent variable (stored in `fish_variables`, no file edit): `set -Ux GOPATH ~/go`.

## Notes
- `fish_add_path` stores into the universal `fish_user_paths`, which fish prepends to `PATH`; it ignores non-existent dirs and does not re-add existing ones, so it is safe in `config.fish` (docs). With `--path` it edits `PATH` directly and must then live in `config.fish`.
- Do not `set -U fish_user_paths ... $fish_user_paths` unconditionally in `config.fish`; it grows each start (tutorial warning).
- Scope flags: `-l` local, `-g` global, `-U` universal; `-x` export; `-e` erase; `-u` unexport. `set -q VAR` tests existence.
- Lists, not strings: `set PATH $PATH /x` works because `$PATH` expands to its elements; colon-separated values from outside are split automatically for `PATH`, `CDPATH`, `MANPATH`.
- Variables from bash-style scripts (`export FOO=bar`) do not apply; use a wrapper such as the `bass` plugin, or translate to `set -gx`.
- `env FOO=bar cmd` and `FOO=bar cmd` (fish >= 3.1) set a variable for one command.
- Secrets: `source ~/.config/fish/secrets.fish` from an untracked file, guarded by `test -f`.
