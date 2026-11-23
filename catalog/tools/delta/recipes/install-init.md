---
capability: install-init
tool: delta
os: windows, macos, linux
verified: 2026-11-23 (docs; delta 0.21.2 on Windows 11)
sources: https://dandavison.github.io/delta/installation.html, https://dandavison.github.io/delta/configuration.html
---
# Install delta and make git use it

Install the binary, then point git at it with three config lines. The git package is named `git-delta`; the executable is `delta`.

## Config
Install: Windows `winget install dandavison.delta` or `scoop install delta`; macOS `brew install git-delta` (plus `brew install less`); Arch `sudo pacman -S git-delta`; Fedora `sudo dnf install git-delta`; Debian/Ubuntu `sudo apt install git-delta` (old) or the .deb from https://github.com/dandavison/delta/releases (`sudo dpkg -i file.deb`).

Git config (`git config --global ...` or a block in `~/.gitconfig`):
```gitconfig
[core]
    pager = delta
[interactive]
    diffFilter = delta --color-only
[delta]
    navigate = true
    dark = true            # or light = true; omit for auto-detection
[merge]
    conflictStyle = zdiff3
```
Keep the delta look in its own file and include it, so the rest of `~/.gitconfig` stays untouched:
```gitconfig
[include]
    path = ~/.config/git/delta.gitconfig
```
Verify: `delta --version`, `git diff` in a repo with changes, `delta --show-config` prints every effective setting.

## Notes
- Windows: delta needs a recent `less.exe`; with an old one colors and characters are wrong (docs). Check `less --version`.
- Delta never reads a delta-specific file; all settings come from git config. Override location with `GIT_CONFIG_GLOBAL=/path` (docs), or `git -c delta.line-numbers=false show` for one command.
- `DELTA_FEATURES` (e.g. `+side-by-side`) switches features per shell (docs).
- Works without git: `diff -u a b | delta`.
- If you use `bat cache --build` for custom themes, delta needs a compatible bat version (docs warn of a memory error with mismatched bat), see the theme recipe.
