---
capability: install-init
tool: pipes-rs
os: windows, macos, linux
verified: 2026-11-23 (docs: pipes-rs README; package ids from winget show and scoop search on a Windows 11 machine; Homebrew tap and AUR per README and Repology; not installed or run)
sources: https://github.com/lhvy/pipes-rs#installation, https://repology.org/project/pipes-rs/versions
---
# Install pipes-rs

No shell init. The Windows-capable pipes screensaver; on macOS and Linux `pipes.sh` is the lighter option, but pipes-rs works there too and the command line is the same everywhere.

## Config
- Windows: `winget install lhvy.pipes-rs` (portable zip, 1.6.4) or `scoop bucket add extras` then `scoop install pipes-rs`
- macOS: `brew install lhvy/tap/pipes-rs`
- Linux: `cargo install --git https://github.com/lhvy/pipes-rs` (README method). Arch: AUR `pipes-rs` or `pipes-rs-bin`. No apt or dnf package found.
- Anywhere: download a binary from https://github.com/lhvy/pipes-rs/releases/latest
Verify: `pipes-rs --version`. Quit with Ctrl+C (other quit keys are not documented).

## Start in a pane
```
pipes-rs -c ansi -p 3 -k heavy,curved -d 20
```
Colors and flags: `theme.md`, `config.md`.

## Notes
- Do not `cargo install pipes-rs` from crates.io: that name is a different, old crate (0.1.1). Use the `--git` form.
- Binaries on Windows are standalone; no runtime install was mentioned in the README.
