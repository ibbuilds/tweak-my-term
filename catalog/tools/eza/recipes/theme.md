---
capability: theme
tool: eza
os: windows, macos, linux
verified: 2026-11-23 (eza 0.23.5 on Windows 11: theme.yml with hex colors applied; env var override observed)
sources: https://github.com/eza-community/eza/blob/main/man/eza_colors-explanation.5.md, https://github.com/eza-community/eza-themes, https://github.com/eza-community/eza/blob/main/man/eza_colors.5.md
---
# Color eza from the look-spec palette

Two mechanisms: `theme.yml` (full control, hex colors, icons) and the `EZA_COLORS`/`LS_COLORS` environment variables (two-letter codes and globs, SGR sequences). With nothing set, eza uses ANSI colors, which already follow the terminal palette.

## Config
`theme.yml` in `$EZA_CONFIG_DIR` (any directory, file must be named `theme.yml`) or `$XDG_CONFIG_HOME/eza/theme.yml`. Values are named colors or quoted hex:
```yaml
colourful: true
filekinds:
  normal:      {foreground: "{palette.foreground}"}
  directory:   {foreground: "{palette.ansi.blue}", is_bold: true}
  symlink:     {foreground: "{palette.ansi.cyan}"}
  executable:  {foreground: "{palette.ansi.green}"}
  pipe:        {foreground: "{palette.ansi.brightBlack}"}
  socket:      {foreground: "{palette.ansi.brightBlack}"}
  special:     {foreground: "{palette.ansi.magenta}"}
perms:
  user_read:          {foreground: "{palette.ansi.yellow}", is_bold: true}
  user_write:         {foreground: "{palette.ansi.red}", is_bold: true}
  user_execute_file:  {foreground: "{palette.ansi.green}", is_bold: true}
  group_read:         {foreground: "{palette.ansi.yellow}"}
  group_write:        {foreground: "{palette.ansi.red}"}
  group_execute:      {foreground: "{palette.ansi.green}"}
size:
  number_byte: {foreground: "{palette.foreground}"}
  number_kilo: {foreground: "{palette.ansi.green}"}
  number_mega: {foreground: "{palette.ansi.yellow}"}
  number_giga: {foreground: "{palette.ansi.red}"}
  unit_byte:   {foreground: "{palette.ansi.brightBlack}"}
users:
  user_you:   {foreground: "{palette.ansi.yellow}"}
  user_other: {foreground: "{palette.ansi.brightBlack}"}
git:
  new:      {foreground: "{palette.ansi.green}"}
  modified: {foreground: "{palette.ansi.yellow}"}
  deleted:  {foreground: "{palette.ansi.red}"}
  ignored:  {foreground: "{palette.ansi.brightBlack}"}
git_repo:
  branch_main:  {foreground: "{palette.ansi.green}"}
  branch_other: {foreground: "{palette.ansi.yellow}"}
  git_clean:    {foreground: "{palette.ansi.green}"}
  git_dirty:    {foreground: "{palette.ansi.red}"}
file_type:
  image:      {foreground: "{palette.ansi.magenta}"}
  video:      {foreground: "{palette.ansi.magenta}"}
  music:      {foreground: "{palette.ansi.cyan}"}
  document:   {foreground: "{palette.ansi.green}"}
  compressed: {foreground: "{palette.ansi.red}"}
  source:     {foreground: "{palette.ansi.yellow}"}
date:        {foreground: "{palette.ansi.brightBlack}"}
punctuation: {foreground: "{palette.ansi.brightBlack}"}
header:      {foreground: "{palette.ansi.brightBlack}", is_underline: true}
```
Point eza at it when it is not under the XDG path (always on Windows):
```sh
export EZA_CONFIG_DIR="$HOME/.config/eza"            # bash/zsh
```
```powershell
[Environment]::SetEnvironmentVariable('EZA_CONFIG_DIR', "$HOME\.config\eza", 'User')
```
Ready-made themes (catppuccin, dracula, gruvbox, frosty...): `https://raw.githubusercontent.com/eza-community/eza-themes/main/themes/<name>.yml`, copy to `theme.yml`.

Env-var form (works on every eza version), colors as SGR:
```sh
export EZA_COLORS="di=1;38;2;R;G;B:ex=38;2;R;G;B:da=38;5;244:uu=0:gu=0"
```
Style keys of `theme.yml`: `foreground`, `background`, `is_bold`, `is_dimmed`, `is_italic`, `is_underline`, `is_blink`, `is_reverse`, `is_hidden`, `is_strikethrough`, `prefix_with_reset`. Icons per name or extension: `extensions: { rs: {icon: {glyph: "X"}} }`.

## Notes
- Precedence (observed on eza 0.23.5): `EZA_COLORS` and `LS_COLORS` set in the environment override `theme.yml`. If a theme "does nothing", run `env | grep -E '^(EZA|EXA|LS)_COLORS'` first; presets that export `LS_COLORS` (for fd, bat, ls) will mask the file.
- `EXA_COLORS` is read when `EZA_COLORS` is unset.
- A syntax error silently drops properties (docs): validate the YAML with any linter and check one color visually.
- `LS_COLORS` set to truecolor values also colors `fd` and GNU `ls`; one string for all three keeps them consistent (see the fd recipe).
- Light terminals: replace `brightBlack` text roles with a darker `foreground` mix, eza does not adapt by itself.
- Check: `EZA_CONFIG_DIR=<dir> eza -l --color=always | cat -v` shows `38;2;R;G;B` for hex colors.
