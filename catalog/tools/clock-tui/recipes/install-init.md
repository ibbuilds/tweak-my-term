---
capability: install-init
tool: clock-tui
os: windows, macos, linux
verified: 2026-11-23 (docs: README, Cargo.toml, src/ read on GitHub; winget and scoop searched on a Windows 11 machine and have no package; not installed or run)
sources: https://github.com/race604/clock-tui#usage, https://raw.githubusercontent.com/race604/clock-tui/master/clock-tui/Cargo.toml, https://crates.io/crates/clock-tui
---
# Install clock-tui (`tclock`)

No shell init. The crate is `clock-tui`, the binary is `tclock`. The README documents cargo only: no winget, scoop or Homebrew package exists (checked), so all OSes need a Rust toolchain. It is the only clock in the catalog that covers Windows.

## Config
1. Rust toolchain (skip if `cargo --version` works):
   - Windows: `winget install Rustlang.Rustup`, then `rustup default stable`. The MSVC target also needs the Visual Studio Build Tools (rustup offers to install them).
   - macOS: `brew install rustup`, then `rustup default stable` (or the rustup.rs script).
   - Linux: your distro's `rustup`, or the rustup.rs script; Arch users can take the AUR package `clock-tui` instead.
2. `cargo install clock-tui`
Verify: `tclock --version`. `cargo` installs to `~/.cargo/bin` (`%USERPROFILE%\.cargo\bin` on Windows); that folder must be on PATH.
Quit with `q`.

## Start in a pane
```
tclock -c '#RRGGBB' -s 2 clock
```
Colors, size and other flags are in `theme.md` and `config.md`.

## Notes
- Version on crates.io: 0.6.1. Built on crossterm and ratatui, so the same code runs on Windows, macOS and Linux; no Windows run was seen. GitHub releases list no confirmed binaries, so do not plan on a prebuilt download.
- A `cargo install` compiles from source: expect a minute or two and a few hundred MB in `~/.cargo`. Offer it to the user before running it (it installs a toolchain).
