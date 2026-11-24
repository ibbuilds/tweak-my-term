---
capability: install-init
tool: pipes-sh
os: macos, linux
verified: 2026-11-23 (docs: pipes.sh source and help text 1.3.0, Homebrew formula, Debian package, AUR and Repology listings; not installed or run)
sources: https://github.com/pipeseroni/pipes.sh, https://raw.githubusercontent.com/pipeseroni/pipes.sh/master/pipes.sh, https://formulae.brew.sh/formula/pipes-sh, https://repology.org/project/pipes.sh/versions
---
# Install pipes.sh

No shell init. A single bash script. Not for Windows: use `pipes-rs` there (same idea, native binary).

## Config
- macOS: `brew install pipes-sh` (formula name `pipes-sh`; the installed command is expected to be `pipes.sh`, not checked)
- Debian/Ubuntu: `sudo apt install pipes.sh`
- Arch: AUR package `pipes.sh` (no official package)
- Fedora, or anywhere else: no package found; download the script and put it on PATH:
  `curl -fsSL https://raw.githubusercontent.com/pipeseroni/pipes.sh/master/pipes.sh -o ~/.local/bin/pipes.sh && chmod +x ~/.local/bin/pipes.sh`
Verify: `pipes.sh -v` (prints `pipes.sh 1.3.0`).

## Start in a pane
```
pipes.sh -p 3 -t 1 -f 60 -c 2 -c 4 -c 6
```
Any key press exits the animation (source: the main loop breaks on a key), so do not leave it in a pane you type into; the dashboard recipe should use a pane the user does not focus.

## Notes
- Version 1.3.0 in Homebrew, Debian 13, Ubuntu 24.04 to 25.10 and AUR.
- Requires bash and `tput` (ncurses). The macOS system bash is 3.2; the script's use of newer bash features there was not checked. If it fails, `brew install bash` and run it with that.
- Colors and flags: `theme.md`, `config.md`.
