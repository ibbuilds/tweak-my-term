---
capability: font-fallback
tool: alacritty
os: windows, macos, linux
verified: 2026-11-23 (docs, alacritty 0.17.0)
sources: https://alacritty.org/config-alacritty.html
---
# Font fallback in Alacritty
Alacritty has no font fallback list. Glyphs missing from the configured family are resolved by the operating system's font fallback. For Nerd Font icons the dependable route is a patched Nerd Font as the main family.

## Config
```toml
[font.normal]
family = "{font.family} Nerd Font"   # use the exact patched family name, e.g. "JetBrainsMono Nerd Font"
style = "Regular"
```

## Notes
- Check the installed family name with the OS font list (`fc-list` on Linux); the patched family is named "<Font> Nerd Font" or "<Font> Nerd Font Mono".
- Whether a separately installed "Symbols Nerd Font Mono" is picked up through OS fallback is not confirmed for Windows; do not rely on it there.
- Powerline separator glyphs U+E0B0-E0B3 are drawn by Alacritty itself (`font.builtin_box_drawing = true`, the default).
- A WezTerm or Windows Terminal preset can instead list a symbols font after the primary one.
