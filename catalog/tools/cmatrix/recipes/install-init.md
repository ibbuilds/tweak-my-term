---
capability: install-init
tool: cmatrix
os: macos, linux
verified: 2026-11-23 (docs: cmatrix README and man page, Homebrew formula, Repology listings; not installed or run)
sources: https://github.com/abishekvashok/cmatrix#readme, https://raw.githubusercontent.com/abishekvashok/cmatrix/master/cmatrix.1, https://formulae.brew.sh/formula/cmatrix, https://repology.org/project/cmatrix/versions
---
# Install cmatrix

No shell init. Not for Windows: the README only covers a mingw-w64 build, and there is no winget or scoop package. Use `rusty-rain` on Windows.

## Config
- macOS: `brew install cmatrix`
- Debian/Ubuntu: `sudo apt install cmatrix`
- Fedora: `sudo dnf install cmatrix`
- Arch: `sudo pacman -S cmatrix`
Verify: `cmatrix -V`. Quit with `q` (or Ctrl+C); `-s` makes the first key press exit.

## Start in a pane
```
cmatrix -b -u 3 -C cyan
```
Colors: `theme.md`. Flags: `config.md`.

## Notes
- Version 2.0 on all of the above.
- The man page lists `-C` colors as green, red, blue, white, yellow, cyan, magenta and black only.
