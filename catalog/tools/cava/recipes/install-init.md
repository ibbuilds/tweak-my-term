---
capability: install-init
tool: cava
os: windows, macos, linux
verified: 2026-11-23 (docs: cava README and example config; winget show karlstav.cava on a Windows 11 machine; Homebrew formula and Repology for the rest; not installed or run)
sources: https://github.com/karlstav/cava#readme, https://formulae.brew.sh/formula/cava, https://repology.org/project/cava/versions
---
# Install cava

No shell init. The only audio visualizer in the catalog; it listens to what the computer plays (or a microphone / fifo) and draws bars in the pane.

## Config
- Windows: `winget install karlstav.cava` (1.0.0, MSI). Not in scoop. Audio is captured from the default output device automatically; no input settings needed (README).
- macOS: `brew install cava` (1.0.0). Capturing system audio needs a loopback device: see Notes.
- Arch: `sudo pacman -S cava` (1.0.0)
- Fedora: `sudo dnf install cava` (0.10.2)
- Debian/Ubuntu: `sudo apt install cava` (0.6.0 on Debian 13 and Ubuntu 24.04 to 25.10; old, see Notes)
Verify: `cava -v`. Quit with `q` or Ctrl+C. A default config file is created on first launch (see paths in `config.md`).

## Start in a pane
```
cava -p ~/.config/cava/dashboard.conf
```
Windows (PowerShell): `cava -p "$env:USERPROFILE\.config\cava\dashboard.conf"`. Draft the file in the run folder first; `config.md` and `theme.md` give its contents.

## Notes
- Linux input: pulse, pipewire or alsa is picked automatically in the order the build supports; with PipeWire or PulseAudio `source = auto` follows the monitor of the default output. If the bars stay flat, set `method` and `source` in `[input]` (README "Capturing audio").
- macOS: use a terminal other than the default Terminal.app (README: it does not render correctly). To capture system sound install BlackHole or Background Music and use `method = portaudio`, or on macOS 14.2+ with a build that has tap support `method = coreaudio` and `source = tap`.
- Debian and Ubuntu ship 0.6.0, far behind 1.0.0. Every key in `theme.md` and `config.md` was checked against the current (1.0.0) example config only; test the installed version, or install a newer build from https://github.com/karlstav/cava/releases or source.
- Konsole does not support the gradient (README); use a single `foreground` color there.
