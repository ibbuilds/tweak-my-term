---
capability: suggestions
tool: ble.sh
os: windows, macos, linux
verified: 2026-11-23 (docs, ble.sh 0.4 devel)
sources: https://github.com/akinomyoga/ble.sh/wiki/Manual-%C2%A77-Completion
---
# Auto-complete suggestions (fish/zsh-autosuggestions style)
ble.sh's `auto-complete` shows a grey suggested completion after the cursor from history and from syntax-aware completion. Needs bash 4.0+; on by default.

## Config
```bash
# ~/.blerc
bleopt complete_auto_complete=1            # empty value disables
bleopt complete_auto_delay=300             # ms to wait before suggesting (README example value)
bleopt complete_auto_history=1             # use history as a source
bleopt complete_auto_complete_opts=        # colon list: history-disabled, syntax-disabled, suppress-after-complete, suppress-inside-line, suppress-inside-word, syntax-unique, ...
bleopt complete_limit_auto_menu=100        # menu limit for auto-complete (0.4)
```
Accept keys while a suggestion is shown: `right`/`C-f`/`C-e`/`end` insert it at end of line, `M-f`/`C-right` insert the first word, `M-right` first word, `S-RET` insert, `C-j`/`C-RET` insert and run, `C-g` cancel.

## Notes
- Disable both suggestion sources for speed: `bleopt complete_auto_complete=` or just `complete_auto_opts` with `history-disabled`.
- Suggestion look: face `auto_complete` (default `bg=254,fg=238`); see the colors recipe.
- Syntax-based suggestions run programmable completion, which can be slow with heavy bash-completion scripts; `syntax-disabled` keeps history only.
- zsh/fish users get the equivalent from zsh-autosuggestions / built-in fish suggestions; PowerShell from PSReadLine prediction.
