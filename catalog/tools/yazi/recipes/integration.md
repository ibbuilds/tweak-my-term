---
capability: integration
tool: yazi
os: windows, macos, linux
verified: 2026-11-23 (docs quick-start and installation pages; yazi not installed on the verification machine)
sources: https://yazi-rs.github.io/docs/quick-start#shell-wrapper, https://yazi-rs.github.io/docs/installation
---
# Shell wrapper `y` and the tools yazi calls

Running `yazi` directly leaves the shell in the old directory. The `y` wrapper starts yazi with `--cwd-file` and `cd`s to the last directory on exit (docs recommend it).

## Config
bash / zsh (`~/.bashrc`, `~/.zshrc`):
```bash
function y() {
	local tmp cwd; tmp="$(mktemp -t "yazi-cwd.XXXXXX")"
	command yazi "$@" --cwd-file="$tmp"
	IFS= read -r -d '' cwd < "$tmp"
	[ "$cwd" != "$PWD" ] && [ -d "$cwd" ] && builtin cd -- "$cwd" || builtin true
	command rm -f -- "$tmp"
}
```
fish (`~/.config/fish/functions/y.fish`):
```fish
function y
	set tmp (mktemp -t "yazi-cwd.XXXXXX")
	command yazi $argv --cwd-file="$tmp"
	if read -z cwd < "$tmp"; and [ "$cwd" != "$PWD" ]; and test -d "$cwd"
		builtin cd -- "$cwd"
	end
	command rm -f -- "$tmp"
end
```
PowerShell (`$PROFILE`):
```powershell
function y {
	$tmp = (New-TemporaryFile).FullName
	yazi.exe @args --cwd-file="$tmp"
	$cwd = Get-Content -Path $tmp -Encoding UTF8
	if ($cwd -and $cwd -ne $PWD.Path -and (Test-Path -LiteralPath $cwd -PathType Container)) {
		Set-Location -LiteralPath (Resolve-Path -LiteralPath $cwd).Path
	}
	Remove-Item -Path $tmp
}
```
cmd.exe: a `y.cmd` file on PATH (see the docs page for the script); Nushell, Elvish and POSIX variants are on the same page.
Tools yazi uses when on PATH: `fd` (search), `rg` (content search), `fzf` (subtree navigation, >= 0.53.0), `zoxide` (jump to visited dirs, needs fzf), `ffmpeg`, `7zip`, `jq`, `poppler`, `resvg`, ImageMagick (previews). See their entries.
Editor/opener rules live in `yazi.toml` (`[opener]`, `[open]`); see `config.md`.

## Notes
- The function is named `y`; do not alias `y` elsewhere. In bash, source it from the same rc block as the other aliases so it exists in interactive shells only.
- Image previews depend on the terminal protocol (see the yazi image-preview docs and the terminal entry).
- Windows: `file.exe` must be reachable via `YAZI_FILE_ONE` (see install-init) or file types and previews fail.
- Flavors/themes: see `theme.md`; Nerd Font: recommended by the docs for icons.
