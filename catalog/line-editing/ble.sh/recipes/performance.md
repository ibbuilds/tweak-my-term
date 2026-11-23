---
capability: performance
tool: ble.sh
os: windows, macos, linux
verified: 2026-11-23 (machine for Windows numbers; docs for options)
sources: https://github.com/akinomyoga/ble.sh/wiki/Manual-%C2%A71-Introduction, https://raw.githubusercontent.com/akinomyoga/ble.sh/master/README.md
---
# Performance and cost
ble.sh is written in Bash, so every keystroke runs shell code. On Linux it is comfortable; on Windows (Git Bash / MSYS2, where forking is expensive) it is not.

## Config
Measured on this Windows 11 machine, Git Bash: 24-60 ms added per keystroke and ~0.9 s added to each new tab. Do not enable it for the Windows Git Bash profile; use PowerShell with PSReadLine 2.2+.

If you keep it, cut work:
```bash
# ~/.blerc
bleopt complete_auto_complete=             # no suggestions
bleopt complete_auto_delay=300             # or delay them (ms)
bleopt highlight_syntax=                   # no syntax analysis
bleopt highlight_filename=
bleopt highlight_variable=
bleopt complete_menu_filter=               # (bash 4+) no menu filtering
bleopt exec_elapsed_mark=                  # no "[ble: elapsed ...]" markers
bleopt edit_marker=
```
Defer optional integrations: `ble-import -d integration/fzf-key-bindings`.

## Notes
- Startup shape: `source ble.sh --attach=none` loads definitions, `ble-attach` hooks the terminal; keep other slow rc work (nvm, conda, completion scripts) lazy.
- macOS bash 3.2 lacks auto-complete entirely; install bash 5 (`brew install bash`).
- Alternatives with lower per-key cost: PSReadLine (PowerShell), zsh-autosuggestions + zsh-syntax-highlighting (zsh), fish built-ins.
- Prompt tools that use ble.sh (Starship transient/right prompt, Oh My Posh transient) inherit this cost in bash.
