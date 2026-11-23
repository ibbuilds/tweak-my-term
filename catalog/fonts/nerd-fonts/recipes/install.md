---
capability: install
tool: nerd-fonts
os: windows, macos, linux
verified: 2026-11-23 (v3.5.1 archives inspected; scoop-nerd-fonts installer script read; registry layout checked on a Windows 11 machine)
sources: https://github.com/ryanoasis/nerd-fonts#font-installation, https://github.com/matthewjberger/scoop-nerd-fonts/blob/master/bucket/JetBrainsMono-NF.json, https://github.com/ryanoasis/nerd-fonts/blob/master/install.sh
---
# Install a Nerd Font per user, no admin

Download `https://github.com/ryanoasis/nerd-fonts/releases/latest/download/<Name>.zip` (or `.tar.xz`, same contents, smaller), put the font files in the user font folder, refresh the font cache. `<Name>` is the release archive name from `fonts.json` (`name`), for example `JetBrainsMono`, `CascadiaCode`, `Meslo`. Checksums: `https://github.com/ryanoasis/nerd-fonts/releases/latest/download/SHA-256.txt`.

## Config

### Windows (PowerShell, per user, no admin, Windows 10 1809+)
```powershell
$name = 'JetBrainsMono'          # archive name from fonts.json
$pick = '*NerdFontMono-*'        # which variant files to install, see Notes
$tmp  = Join-Path $env:TEMP "nf-$name"
$dir  = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
$reg  = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
New-Item -ItemType Directory -Force $tmp, $dir | Out-Null
Invoke-WebRequest "https://github.com/ryanoasis/nerd-fonts/releases/latest/download/$name.zip" -OutFile "$tmp.zip"
Expand-Archive "$tmp.zip" $tmp -Force
Get-ChildItem $tmp -Recurse -Include *.ttf,*.otf | Where-Object Name -like $pick | ForEach-Object {
  Copy-Item $_.FullName $dir -Force
  New-ItemProperty -Path $reg -Name ($_.BaseName + ' (TrueType)') -Value (Join-Path $dir $_.Name) -PropertyType String -Force | Out-Null
}
Remove-Item $tmp, "$tmp.zip" -Recurse -Force
```
Packaged apps (Windows Terminal from the Store) read per-user fonts only if the folder grants read to ALL APPLICATION PACKAGES. The scoop font manifests do exactly this:
```powershell
$acl = Get-Acl $dir
foreach ($sid in 'S-1-15-2-1','S-1-15-2-2') {
  $acl.SetAccessRule([System.Security.AccessControl.FileSystemAccessRule]::new([System.Security.Principal.SecurityIdentifier]::new($sid),'ReadAndExecute','ContainerInherit,ObjectInherit','None','Allow'))
}
Set-Acl $dir $acl
```
Scoop alternative: `scoop bucket add nerd-fonts; scoop install nerd-fonts/JetBrainsMono-NF-Mono`.

### macOS
```sh
brew install --cask font-jetbrains-mono-nerd-font     # cask name = fonts.json "brew"
# or without brew
mkdir -p ~/Library/Fonts && curl -fsSL -o /tmp/nf.zip https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.zip \
  && unzip -o /tmp/nf.zip '*NerdFontMono-*' -d ~/Library/Fonts && rm /tmp/nf.zip
```

### Linux
```sh
d="${XDG_DATA_HOME:-$HOME/.local/share}/fonts/JetBrainsMono"
mkdir -p "$d" && curl -fsSL https://github.com/ryanoasis/nerd-fonts/releases/latest/download/JetBrainsMono.tar.xz | tar -xJ -C "$d"
fc-cache -f
fc-list : family | grep -i JetBrainsMono
```
Arch: `sudo pacman -S ttf-jetbrains-mono-nerd` (system-wide, needs sudo). The repo's `install.sh <Name>` installs to `~/.local/share/fonts` on Linux and `~/Library/Fonts` on macOS, then runs `fc-cache`.

## Notes
- Each archive holds three variants per family: `...NerdFont-*` (default), `...NerdFontMono-*` (strict single-width icons) and `...NerdFontPropo-*` (proportional, not for terminals). JetBrainsMono ships 96 font files; install only the variant you need to keep the font list short. For terminals prefer Mono, see `configure.md`.
- The installed family name differs per font and release: v3.5.1 names JetBrainsMono `JetBrainsMono NF` / `NFM` / `NFP` but Hack `Hack Nerd Font` / `Hack Nerd Font Mono`. Take it from `fonts.json` `family`, then confirm with `fc-list : family` (Linux/macOS) or the installed-families list (Windows). Never type a family name from memory.
- Windows per-user registry layout (observed on a Windows 11 machine, also what scoop writes): value name `<file base name> (TrueType)`, data = full path in the user Fonts folder. `.otf` files are registered with the same `(TrueType)` suffix. Restart the terminal; some apps need a sign-out.
- Windows before 1809 and machine-wide installs (`%windir%\Fonts`, HKLM) need admin.
- A PowerShell piped `Invoke-WebRequest` download is ~50-130 MB for large families (JetBrainsMono.zip is 134 MB); prefer the `.tar.xz` on Linux/macOS.
