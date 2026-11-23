---
capability: install-init
tool: btop
os: windows, macos, linux
verified: 2026-11-23 (docs: btop and btop4win READMEs, package ids from winget and scoop searches on a Windows 11 machine; btop not run)
sources: https://github.com/aristocratos/btop#installation, https://github.com/aristocratos/btop4win#installation
---
# Install btop

No shell init. Windows has a separate project, btop4win; the main btop README says Windows support is not in its own plans.

## Config
- Windows: `winget install aristocratos.btop4win` or `scoop install btop` (btop4win); sensors variant `scoop install btop-lhm`. Manual: extract the btop4win zip anywhere and run `btop4win.exe` (needs the MSVC runtime, https://aka.ms/vs/17/release/vc_redist.x64.exe).
- macOS: `brew install btop`
- Debian/Ubuntu `sudo apt install btop`; Fedora `sudo dnf install btop`; Arch `sudo pacman -S btop`
Verify: `btop --version`. Start with `btop`; `q` quits, `Esc` opens the menu where every option is editable.

## Notes
- Versions: Debian 13 ships 1.3.2, Ubuntu 24.04 1.3.0, Fedora 43 1.4.4, Arch 1.4.8, Homebrew 1.4.8, btop4win 1.0.5.
- btop4win needs Windows 10 1607+ for ANSI sequences; Windows Terminal recommended (README).
- Needs a UTF-8 terminal and a font covering Braille Patterns, Geometric Shapes, Box Drawing and Block Elements; otherwise set `graph_symbol = "block"` or `"tty"` (see `config.md`).
