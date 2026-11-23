---
capability: configure
tool: nerd-fonts
os: windows, macos, linux
verified: 2026-11-23 (family names read from the v3.5.1 release archives)
sources: https://github.com/ryanoasis/nerd-fonts/releases/tag/v3.5.1, https://github.com/ryanoasis/nerd-fonts#variations
---
# Name the font in the terminal config

Terminals reference the installed family name, not the file. Pick the variant, then write the exact family string.

## Config
Variant rule, applied to `family` from `fonts.json`:

| Want | Family string | Use for |
|---|---|---|
| Mono (single-width icons, fits the cell) | `family` + `M` if it ends in `NF` (`JetBrainsMono NFM`), else `family` + ` Mono` (`Hack Nerd Font Mono`) | default for terminals |
| Normal (icons may overhang about 1.5 cells) | `family` as listed (`JetBrainsMono NF`) | bigger icons when cell space allows |
| Propo (proportional icons) | `... NFP` / `... Nerd Font Propo` | editors and UI, not terminals |

Look spec to terminal examples (`font.family` = resolved family):
```jsonc
// Windows Terminal profile
"font": { "face": "JetBrainsMono NFM", "size": 12 }
```
```toml
# Alacritty
[font.normal]
family = "JetBrainsMono NFM"
```
```lua
-- WezTerm
config.font = wezterm.font("JetBrainsMono NFM")
```
```
# kitty
font_family JetBrainsMono NFM
# Ghostty
font-family = JetBrainsMono NFM
```
Verify before applying: Linux/macOS `fc-list : family | grep -i "<family>"`; Windows use the `detect` command in `tool.json`.

## Notes
- Names are not uniform in v3.5.1. Long-name fonts use short suffixes (`JetBrainsMono NF/NFM/NFP`, `GeistMono NF`, `CaskaydiaCove NF`, `SauceCodePro NF`, `Iosevka NF`, `IosevkaTerm NF`, `ZedMono NF`, `VictorMono NF`, `MartianMono NF`, `IntoneMono NF`, `MonaspiceNe NF`); the rest keep `... Nerd Font`, `... Nerd Font Mono`, `... Nerd Font Propo`. Family names can change between releases (an existing config written for an older install may not match a fresh install), so always re-read the installed name.
- Style variants (Bold, Italic, Light) share the family name; terminals pick Bold/Italic from the same family. Set weight separately.
- With a patched Mono font as primary no fallback is needed. For unpatched fonts see `nerd-glyphs.md`.
- Ligatures come from the base font (`fonts.json` `ligatures`), not the Mono/Propo split. JetBrainsMono also ships a no-ligature NL family (`JetBrainsMonoNL NFM`).
- Normal-width icons look larger but can clip or overlap in strict-cell terminals; Mono is the safe default. eza, lazygit, yazi and starship icons work with either.
