---
capability: shell-integration
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/shell-integration/, https://sw.kovidgoyal.net/kitty/conf/
---
# Shell integration in kitty
Enabled by default for zsh, fish and bash via `shell_integration enabled`. It marks prompts, reports cwd and sets titles.
## Config
```
shell_integration enabled
# disable pieces: shell_integration enabled no-cursor no-title
# manual setup: shell_integration disabled   (then source the script yourself)
```
## Notes
- Space separated flags: `disabled`, `no-rc`, `no-cursor`, `no-title`, `no-cwd`, `no-prompt-mark`, `no-complete`, `no-sudo`.
- Features: jump to prompt, open last command output in a pager, click to move cursor, clone shell into a new window, edit files remotely over SSH.
- Manual zsh setup guards on `KITTY_INSTALLATION_DIR` and autoloads `kitty-integration`; the bash/fish manual lines were not fully read here. See the Manual shell integration section of the docs.
- When automatic injection does not apply, set `shell_integration disabled` and source the script manually.
