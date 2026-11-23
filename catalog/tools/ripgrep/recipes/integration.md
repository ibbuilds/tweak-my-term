---
capability: integration
tool: ripgrep
os: windows, macos, linux
verified: 2026-11-23 (docs: fzf ADVANCED.md; rg 15.2.0 flags checked with --help)
sources: https://github.com/junegunn/fzf/blob/master/ADVANCED.md#using-fzf-as-interactive-ripgrep-launcher, https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md
---
# Use ripgrep with fzf (live grep) and bat (preview)

ripgrep does the searching, fzf is the interface, bat shows the matching line. This is the "interactive ripgrep launcher" from fzf's ADVANCED.md.

## Config
Bash script `rfv` (save in `~/.local/bin`, `chmod +x`; also works in Git Bash on Windows):
```bash
#!/usr/bin/env bash
RG_PREFIX="rg --column --line-number --no-heading --color=always --smart-case "
INITIAL_QUERY="${*:-}"
fzf --ansi --disabled --query "$INITIAL_QUERY" \
    --bind "start:reload:$RG_PREFIX {q} || true" \
    --bind "change:reload:sleep 0.1; $RG_PREFIX {q} || true" \
    --delimiter : \
    --preview 'bat --color=always {1} --highlight-line {2}' \
    --preview-window 'up,60%,border-bottom,+{2}+3/3,~3' \
    --bind 'enter:become(${EDITOR:-vim} {1} +{2})'
```
Plain pipelines: `rg -n pattern | fzf --ansi --delimiter : --preview 'bat --color=always {1} --highlight-line {2}'`.
File names only: `rg --files | fzf`; and as the fzf default source `FZF_DEFAULT_COMMAND='rg --files --hidden --glob "!.git/*"'` when fd is not installed.
PowerShell (no bash): `$env:FZF_DEFAULT_COMMAND = 'rg --files --hidden --glob "!.git/*"'`; run `rfv` through Git Bash or port the `--bind` lines (they are fzf options, shell-independent apart from quoting).

## Notes
- `--color=always` is required when piping rg into `fzf --ansi`.
- `sleep 0.1` debounces typing (ADVANCED.md); on Windows Git Bash `sleep` exists, in cmd/PowerShell use `Start-Sleep`.
- `become(...)` replaces fzf with the editor (fzf 0.38.0+ on Unix; on Windows since 0.51.0, where it spawns the editor and waits, per the fzf CHANGELOG).
- Match colors come from `theme.md`; the preview colors from the bat theme.
- Use `--glob '!pattern'` for exclusions inside the command; the `.ignore` and `.rgignore` files are honored automatically.
