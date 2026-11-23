---
capability: default-shell
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Default shell in kitty
`shell` sets the program started in new windows. `.` (default) means `$SHELL` or the user's login shell.
## Config
```
shell /usr/bin/fish
# or with arguments
# shell zsh --login
```
## Notes
- Shell integration injects code based on the shell kitty detects; wrapped shells may need manual integration.
- A program given on the command line (`kitty [options] [program ...]`) overrides it for that launch.
