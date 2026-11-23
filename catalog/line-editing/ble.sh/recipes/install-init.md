---
capability: install-init
tool: ble.sh
os: windows, macos, linux
verified: 2026-11-23 (docs; Windows cost measured on machine; ble.sh 0.4 devel)
sources: https://raw.githubusercontent.com/akinomyoga/ble.sh/master/README.md, https://github.com/akinomyoga/ble.sh/wiki/Manual-%C2%A71-Introduction
---
# Install ble.sh and load it from ~/.bashrc
Build or unpack ble.sh into `~/.local/share/blesh`, source it near the top of `~/.bashrc` with `--attach=none`, and call `ble-attach` as the last line. Pick the 0.4 devel/nightly build: most features (auto-complete, transient prompt, `atuin` support) need it.

## Config
Install (Linux, macOS, Git Bash):
```bash
# from source (needs git, GNU make, GNU awk)
git clone --recursive --depth 1 --shallow-submodules https://github.com/akinomyoga/ble.sh.git
make -C ble.sh install PREFIX=~/.local          # -> ~/.local/share/blesh

# or the nightly tarball (needs curl, tar, xz)
curl -L https://github.com/akinomyoga/ble.sh/releases/download/nightly/ble-nightly.tar.xz | tar xJf -
bash ble-nightly/ble.sh --install ~/.local/share
```
`~/.bashrc`:
```bash
# top of the file
[[ $- == *i* ]] && source -- ~/.local/share/blesh/ble.sh --attach=none
# ... your usual bashrc (prompt, aliases, starship, atuin init) ...
# last line
[[ ! ${BLE_VERSION-} ]] || ble-attach
```
Settings go in `~/.blerc` (or `~/.config/blesh/init.sh`), a bash script sourced while ble.sh loads; override the path with `source ... --rcfile /path`. Template: `blerc.template` in the repo (use the one matching your build).

## Notes
- Windows (Git Bash): costs 24-60 ms per keystroke and ~0.9 s per new tab on this machine. Skip it there; use PSReadLine in PowerShell. Fine on Linux, usable on macOS.
- bash 3.x (macOS /bin/bash) lacks auto-complete and menu-filter; use bash 4+ (`brew install bash`).
- Required by Starship (right prompt and transient prompt) and Oh My Posh (transient, `rprompt`) in bash; Atuin works best with ble.sh >= 0.4 and then `eval "$(atuin init bash)"` after ble.sh is loaded.
- Update: `ble-update` inside a session (0.3+), or `bash ~/.local/share/blesh/ble.sh --update` (0.4+). Uninstall: remove the two rc lines, `~/.blerc`, `~/.local/state/blesh` and the install dir.
- Emergency start without it: `bash --norc`, or comment the `source` line; over ssh rename `.bashrc` non-interactively.
- Debian forky/sid has `apt install ble.sh`; Arch uses AUR `blesh-git`; neither Homebrew core nor Fedora packages it.
- `ble.sh` does not set `PIPESTATUS`; read `BLE_PIPESTATUS` or set `bleopt exec_restore_pipestatus=1`. If PROMPT_COMMAND draws output set `bleopt prompt_command_changes_layout=1`.
