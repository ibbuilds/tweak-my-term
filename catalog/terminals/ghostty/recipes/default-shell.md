---
capability: default-shell
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/config/reference
---
# Default shell in Ghostty
`command` sets the program started in new terminals. Default: `$SHELL`, then the passwd entry.
## Config
```
command = /usr/bin/fish
# explicit modes (since 1.2.0):
# command = direct:/opt/homebrew/bin/zsh -l
# command = shell:echo hi && exec zsh
```
## Notes
- With extra arguments and no prefix the command runs through `/bin/sh -c`; `direct:` runs without a shell, `shell:` forces one.
- `initial-command` applies only to the first surface (the `-e` CLI flag sets it).
- Shell integration is matched by the command's basename; use `shell-integration = <shell>` for unusual names.
