---
capability: history-search
tool: atuin
os: windows, macos, linux
verified: 2026-11-23 (docs, atuin 18.25.1)
sources: https://docs.atuin.sh/cli/configuration/config/
---
# History search behaviour
Ctrl-R opens a fuzzy full-screen or inline search over the SQLite history; inside it Ctrl-R cycles filter modes and Ctrl-S cycles search modes. Defaults are sensible; the keys below change what is searched and how.

## Config
```toml
# ~/.atuin/config.toml
search_mode = "fuzzy"        # prefix | fulltext | fuzzy | daemon-fuzzy (18.13+, needs the daemon)
filter_mode = "global"       # global | host | session | directory | workspace | session-preload
style = "compact"            # auto | full | compact  (docs default: compact)
inline_height = 40           # max lines the UI uses; 0 = full screen
invert = false               # true puts the search box at the top
show_preview = true
enter_accept = true          # Enter runs the command; Tab returns it for editing
exit_mode = "return-original"   # or return-query
history_filter = ["^secret-cmd", "--password=.+"]   # regexes (unanchored): never record these
filter_mode_shell_up_key_binding = "directory"   # Up key searches this directory only

[search]
shells = "auto"              # only commands from the current shell; "all" for every shell
```
`fuzzy` mode has its own query syntax (fzf-style operators, listed under "fuzzy search syntax" in the config docs; the `|` operator is not supported in `daemon-fuzzy`).

## Notes
- `secrets_filter` (on by default) keeps recognised tokens/keys out of history; `history_filter` adds your own patterns; the prune command (docs: reference/prune) removes old entries matching updated filters.
- Enter semantics: older installs had `enter_accept = false`; the shipped default config sets it to `true`.
- Atuin has no inline ghost-text suggestions. Use zsh-autosuggestions/fish/PSReadLine prediction alongside it if wanted.
- Workspaces: `workspaces = true` adds a git-repo-aware filter mode.
