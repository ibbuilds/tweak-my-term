---
capability: install-init
tool: tty-clock
os: macos, linux
verified: 2026-11-23 (docs: README usage text, Homebrew formula, Debian package page and Repology listings; not installed or run)
sources: https://github.com/xorg62/tty-clock, https://formulae.brew.sh/formula/tty-clock, https://repology.org/project/tty-clock/versions
---
# Install tty-clock

No shell init. Not available on Windows: use `clock-tui` (`tclock`) in a Windows pane.

## Config
- macOS: `brew install tty-clock`
- Debian/Ubuntu: `sudo apt install tty-clock`
- Arch: AUR package `tty-clock` (no official package)
- Fedora: no dnf package found; build from source: `sudo dnf install ncurses-devel gcc make git`, then `git clone https://github.com/xorg62/tty-clock && cd tty-clock && make && sudo make install`
Verify: `tty-clock -v`. Quit with `q`.

## Start in a pane
```
tty-clock -s -c -C 4 -b
```
`-c` centers the clock in the pane. `-n` keeps it running on key presses (README: "Don't quit on keypress"), which suits a pane; flags are in `config.md`.

## Notes
- Versions: Homebrew 2.3, Debian 13 and Ubuntu 25.04+ 2.3+git (2021-11), Ubuntu 24.04 2.3, AUR 2.3. The project is stable and rarely updated.
- Needs a terminal with ncurses color support; colors come from the terminal palette (see `theme.md`).
