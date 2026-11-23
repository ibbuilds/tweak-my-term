---
capability: shell-integration
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://man.archlinux.org/man/foot.1, https://man.archlinux.org/man/foot.ini.5
---
# Shell integration in foot
Foot has no injection. It understands OSC 7 (cwd), OSC 133;A (prompt start) and OSC 133;C/D (output start/end); your shell must emit them.
## Config
Minimal bash example for `~/.bashrc` (emits OSC 7 and the prompt mark before each prompt):
```bash
_foot_osc() { printf '\e]7;file://%s%s\e\\' "$HOSTNAME" "$PWD"; printf '\e]133;A\e\\'; }
PROMPT_COMMAND="_foot_osc${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
```
## Notes
- What it enables: new terminals (`spawn-terminal`, Ctrl+Shift+N) open in the same directory (OSC 7); jump between prompts with Ctrl+Shift+Z / Ctrl+Shift+X (OSC 133;A); the `pipe-command-output` binding (Ctrl+Shift+G) uses OSC 133;C and D.
- The snippet does not percent-encode special characters in `$PWD`; foot's wiki has hardened per-shell snippets (not fetched here).
- Add `\e]133;C` (before running a command) and `\e]133;D;$?` (after) for command output piping; shell-specific hooks (zsh `preexec`/`precmd`, fish events) are needed.
- Fish 4.0+ already emits OSC 133 prompt marks.
