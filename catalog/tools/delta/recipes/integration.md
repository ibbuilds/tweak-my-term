---
capability: integration
tool: delta
os: windows, macos, linux
verified: 2026-11-23 (docs; lazygit pager block taken from a working Windows 11 config, delta 0.21.2)
sources: https://dandavison.github.io/delta/configuration.html, https://github.com/jesseduffield/lazygit/blob/master/docs/Custom_DiffRenderers.md, https://dandavison.github.io/delta/tips-and-tricks/using-delta-on-windows.html
---
# Use delta as the pager for git, lazygit and friends

delta reads a diff on stdin and prints a highlighted one. Wire it where diffs are shown.

## Config
git (all `git diff`, `show`, `log -p`, `stash show -p`, `add -p`):
```gitconfig
[core]
    pager = delta
[interactive]
    diffFilter = delta --color-only      # keeps `git add -p` working
[delta]
    navigate = true                      # n / N jump between files in the pager
```
lazygit (`config.yml`; the key is `git.diffRenderers` in lazygit 0.66, called "custom pagers" in older versions; see the lazygit entry):
```yaml
git:
  diffRenderers:
    - command: delta --dark --paging=never      # type stdinFilter is the default
```
Lazygit command templates allow `{{width}}` and `{{colorScheme}}` (`delta --paging=never {{if gt .width 160}}--side-by-side{{end}}`).

Jujutsu (`~/.config/jj/config.toml`):
```toml
[ui]
pager = "delta"
diff-formatter = ":git"
```
Per-shell switches: `export DELTA_FEATURES=+side-by-side` (and `DELTA_FEATURES=+` to undo).
Alias for plain diffs outside git: `alias diff='delta'` (bash/zsh), `function diff { delta @args }` (PowerShell).

## Notes
- `--paging=never` is for hosts that supply their own pager (lazygit, tig, ripgrep, editors). In a terminal `git` pages through delta's `less`.
- `--color-only` leaves the input structure unchanged (delta help), which is what `git add -p` needs; keep it for `interactive.diffFilter`.
- Windows: `less.exe` must be recent or colors break (docs); check `less --version`. Set `core.pager = delta` once; no per-shell setup.
- Merge conflicts: `merge.conflictStyle = zdiff3` gives delta the base text to show.
