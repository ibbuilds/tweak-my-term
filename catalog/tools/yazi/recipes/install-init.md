---
capability: install-init
tool: yazi
os: windows, macos, linux
verified: 2026-11-23 (docs; yazi not installed on the verification machine, package version 26.9.1 from repology)
sources: https://yazi-rs.github.io/docs/installation
---
# Install yazi and its prerequisites

yazi needs `file(1)` to detect file types. Everything else (ffmpeg, 7-Zip, jq, poppler, fd, ripgrep, fzf, zoxide, resvg, ImageMagick) is optional and enables previews and search. A Nerd Font is recommended.

## Config
- Windows: `winget install sxyazi.yazi` or `scoop install yazi`
- macOS: `brew install yazi`
- Arch: `sudo pacman -S yazi` (docs list the full optional set: `ffmpeg 7zip jq poppler fd ripgrep fzf zoxide resvg imagemagick`)
- Debian/Ubuntu: official APT repo (amd64, arm64):
```sh
curl -fsSL https://yazi-rs.github.io/builds/yazi-keyring.gpg | sudo tee /usr/share/keyrings/yazi-keyring.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/yazi-keyring.gpg] https://yazi-rs.github.io/builds/ stable main' | sudo tee /etc/apt/sources.list.d/yazi.list >/dev/null
sudo apt update && sudo apt install yazi
```
- Fedora/RHEL 9+: `dnf copr enable lihaohong/yazi && dnf install yazi` (unofficial COPR)

Windows `file.exe` (required):
```powershell
# Git for Windows ships it. Point yazi at it, then restart the terminal.
[Environment]::SetEnvironmentVariable('YAZI_FILE_ONE', 'C:\Program Files\Git\usr\bin\file.exe', 'User')
```
If Git was installed with Scoop the path is `%USERPROFILE%\scoop\apps\git\current\usr\bin\file.exe`.
Windows optional dependencies: `scoop install ffmpeg 7zip jq poppler fd ripgrep fzf zoxide resvg imagemagick`, or with winget `winget install Gyan.FFmpeg 7zip.7zip jqlang.jq oschwartz10612.Poppler sharkdp.fd BurntSushi.ripgrep.MSVC junegunn.fzf ajeetdsouza.zoxide ImageMagick.ImageMagick` (resvg is not on winget).
Verify: `yazi --version`, `ya --version`, then run `yazi` and press `~` for help.

## Notes
- Docs: do not install `file` through Scoop or Chocolatey (cannot handle Unicode filenames); use Git for Windows' `file.exe`, or the `mime-ext.yazi` plugin as a fallback.
- Dependency versions from the docs: fzf >= 0.53.0, ImageMagick >= 7.1.1.
- Image previews depend on the terminal (kitty graphics, sixel, iTerm2); see the terminal's entry. No shell init is needed besides the optional `y` wrapper in `integration.md`.
- Config directory: `~/.config/yazi/` on Unix-like systems, `%AppData%\yazi\config\` on Windows; override with `YAZI_CONFIG_HOME`.
