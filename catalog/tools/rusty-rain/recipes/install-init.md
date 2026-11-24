---
capability: install-init
tool: rusty-rain
os: windows, macos, linux
verified: 2026-11-23 (docs: rusty-rain README and src/cli.rs; winget show cowboy8625.rusty-rain on a Windows 11 machine; not installed or run)
sources: https://github.com/cowboy8625/rusty-rain#readme, https://raw.githubusercontent.com/cowboy8625/rusty-rain/master/src/cli.rs, https://crates.io/crates/rusty-rain
---
# Install rusty-rain

No shell init. A cmatrix-style rain that runs on Windows; on macOS and Linux `cmatrix` is a packaged alternative but rusty-rain takes hex colors.

## Config
- Windows: `winget install cowboy8625.rusty-rain` (0.5.0, portable exe built for `x86_64-pc-windows-gnu`; the README writes `winget install rusty-rain`, the full id is the safe form). Not in scoop.
- macOS and Linux: `cargo install rusty-rain` (crates.io 0.5.1). Needs a Rust toolchain (`brew install rustup` on macOS; the distro's rustup or rustup.rs on Linux).
- Arch: AUR package `rusty-rain` (0.5.1).
- Other: `eget cowboy8625/rusty-rain` or a binary from https://github.com/cowboy8625/rusty-rain/releases.
Verify: `rusty-rain --version`. Quit with `q`, Esc or Ctrl+C.

## Start in a pane
```
rusty-rain -C '#89b4fa' -H '#ffffff' -s -S 0,200
```
Colors: `theme.md`. Flags: `config.md`.

## Notes
- No apt, dnf or Homebrew package found (Repology: AUR only). On a machine without Rust and where the user has not agreed to install a toolchain, use `cmatrix` instead.
- winget's portable install should put `rusty-rain` on PATH via a command alias; confirm with `rusty-rain --version` in a new terminal.
- Needs a font with the glyphs of the chosen `-g` group; the default `bin` group is only 0 and 1.
