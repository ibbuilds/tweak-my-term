---
capability: completion
tool: fish
os: macos, linux
verified: 2026-11-23 (docs, fish 4.9.3 "Completions")
sources: https://fishshell.com/docs/current/completions.html, https://fishshell.com/docs/current/cmds/complete.html, https://fishshell.com/docs/current/cmds/fish_update_completions.html
---
# Completion in fish
Completions are built in and need no setup: file paths, options with descriptions, git branches, and many tools. fish also parses man pages to generate completions for commands without one.

## Config
Add your own, per command, in `~/.config/fish/completions/mytool.fish`:
```fish
complete -c mytool -s v -l verbose -d 'Verbose output'
complete -c mytool -n '__fish_use_subcommand' -a 'build test deploy' -d 'Subcommand'
complete -c mytool -n '__fish_seen_subcommand_from deploy' -l env -xa 'dev staging prod'
```
Tools that print fish completions:
```fish
# in config.fish (cache to a file for speed, see startup-speed)
kubectl completion fish | source
pnpm completion fish | source
```
Regenerate man-page-based completions: `fish_update_completions`.

## Notes
- Completion files autoload from `~/.config/fish/completions/`, `/usr/share/fish/vendor_completions.d/` (distro packages drop theirs there), and `$fish_complete_path`.
- Tab shows a pager; Tab again moves the selection, Shift-Tab goes back; typing filters the list.
- Pager colors: `fish_pager_color_*` (see colors recipe).
- `complete -C 'git ch'` prints what would complete; `complete -c cmd` lists existing rules.
- Slow completions (custom `-a '(slow-command)'`) block the prompt; add `--condition` or cache.
