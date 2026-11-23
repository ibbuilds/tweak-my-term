---
capability: install-init
tool: bat
os: windows, macos, linux
verified: 2026-11-23 (docs; bat 0.26.1 on Windows 11)
sources: https://github.com/sharkdp/bat#installation, https://github.com/sharkdp/bat#using-bat-on-windows
---
# Install bat

bat needs no shell init. Install it, and on Debian/Ubuntu fix the executable name.

## Config
- Windows: `winget install sharkdp.bat` or `scoop install bat` (needs the Visual C++ Redistributable)
- macOS: `brew install bat`
- Arch `sudo pacman -S bat`, Fedora `sudo dnf install bat`, Debian/Ubuntu `sudo apt install bat`
- Debian/Ubuntu when the command is `batcat`:
```sh
mkdir -p ~/.local/bin && ln -sf /usr/bin/batcat ~/.local/bin/bat    # ~/.local/bin must be on PATH
```
Verify: `bat --version`; `bat --list-themes --color=never | head`; `bat --config-file` prints the config path in use.

## Notes
- Windows paging: only `more` exists; install `less` (`scoop install less`, or Chocolatey's `less`) or set `--paging=never` / `BAT_PAGER=` (README). Old `less` builds mangle colors on Windows; the Git for Windows `less` works.
- bat writes a cache of syntaxes and themes in `bat --cache-dir`; run `bat cache --build` after adding themes or syntaxes.
- Piped output is plain (`bat` acts as `cat` when stdout is not a TTY), so aliasing `cat` is safe for scripts that pipe.
