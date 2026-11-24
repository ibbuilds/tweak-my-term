---
capability: install-init
tool: cbonsai
os: macos, linux
verified: 2026-11-23 (docs: cbonsai README on GitLab, Homebrew formula, Repology listings; not installed or run)
sources: https://gitlab.com/jallbrit/cbonsai, https://formulae.brew.sh/formula/cbonsai, https://repology.org/project/cbonsai/versions
---
# Install cbonsai

No shell init. No Windows build or package: use `rusty-rain` or `pipes-rs` for an animated Windows pane.

## Config
- macOS: `brew install cbonsai` (1.4.2)
- Debian/Ubuntu: `sudo apt install cbonsai` (1.3.1 on Debian 13 and Ubuntu 24.04 to 25.10)
- Fedora: `sudo dnf install cbonsai` (1.3.1)
- Arch: AUR package `cbonsai` (1.4.2; no official package)
- Source: needs ncursesw dev headers (`libncursesw5-dev` / `ncursesw5-devel`); `make install PREFIX=~/.local` (README)
Verify: `cbonsai --version`. Quit with `q` or Ctrl+C.

## Start in a pane
```
cbonsai -l -i -t 0.06 -w 25 -L 36 -k 2,3,10,11
```
This grows a tree live, waits 25 s, then grows another, forever. Colors: `theme.md`. Flags: `config.md`.

## Notes
- Debian and Ubuntu ship 1.3.1, older than the 1.4.2 the README documents. Check `cbonsai --help` for each flag before relying on it in a recipe; the flags above (`-l -i -t -w -L -k -m -b -M -S`) come from the current README and were not checked against 1.3.1.
- The tree needs room: a pane of at least about 40 rows by 60 columns grows a full tree (not measured); in a small pane the tree is clipped.
