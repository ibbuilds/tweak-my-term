---
capability: nerd-glyphs
tool: nerd-fonts
os: windows, macos, linux
verified: 2026-11-23 (v3.5.1 NerdFontsSymbolsOnly archive inspected; Symbols fonts present on a Windows 11 machine)
sources: https://github.com/ryanoasis/nerd-fonts#option-7-font-fallback, https://github.com/ryanoasis/nerd-fonts/blob/master/10-nerd-font-symbols.conf
---
# Icon glyphs without patching your font: the symbols-only fallback

Use a patched Nerd Font as the primary font, or keep any unpatched font and add `Symbols Nerd Font Mono` as the fallback. The fallback covers the icon codepoints only; letters come from the primary font.

## Config
Decision:
1. The font is in `fonts.json`: use its Mono family as primary, no fallback needed.
2. The font is unpatched (system font, Berkeley Mono, SF Mono, Cascadia Mono...): install `NerdFontsSymbolsOnly` and add the fallback.
   - Archive `https://github.com/ryanoasis/nerd-fonts/releases/latest/download/NerdFontsSymbolsOnly.zip` has 2 files: `SymbolsNerdFont-Regular.ttf` (family `Symbols Nerd Font`) and `SymbolsNerdFontMono-Regular.ttf` (family `Symbols Nerd Font Mono`).
   - Install with `install.md` (Windows `$pick = 'Symbols*'`), brew cask `font-symbols-only-nerd-font`, Arch `ttf-nerd-fonts-symbols-mono`.
```jsonc
// look.json
"font": { "family": "JetBrains Mono", "fallback": ["Symbols Nerd Font Mono"], "size": 12 }
```
```lua
-- WezTerm
config.font = wezterm.font_with_fallback({ "JetBrains Mono", "Symbols Nerd Font Mono" })
```
```
# kitty: map the private-use ranges to the symbols font
symbol_map U+E000-U+F8FF,U+F0000-U+FFFFD Symbols Nerd Font Mono
```
```jsonc
// Windows Terminal: comma-separated list in font.face, first has priority
"font": { "face": "JetBrains Mono, Symbols Nerd Font Mono" }
```
Linux fontconfig fallback for every app (project README option 7):
```sh
mkdir -p ~/.config/fontconfig/conf.d
curl -fsSL https://raw.githubusercontent.com/ryanoasis/nerd-fonts/master/10-nerd-font-symbols.conf -o ~/.config/fontconfig/conf.d/10-nerd-font-symbols.conf
fc-cache -f
```
The file maps `monospace` and a list of named fonts to prefer `Symbols Nerd Font`.

## Notes
- Prefer `Symbols Nerd Font Mono` (single-width) for terminals; plain `Symbols Nerd Font` icons can be wider than a cell.
- Project README: fallback scaling and placement "can be hit or miss". If icons look offset or small, switch the primary font to a patched Mono family.
- Terminals differ in how they accept a fallback list (Alacritty has no list: install the symbols font and let the OS fall back; kitty needs `symbol_map`; WezTerm and Windows Terminal take lists). The exact key is in each terminal's catalog entry; kitty, WezTerm and Ghostty also ship built-in Nerd Font symbol support (unverified here).
- Icon test: print a few icons (folder, git branch, lock) from the Nerd Fonts cheat sheet https://www.nerdfonts.com/cheat-sheet. Boxes or `?` mean the glyph font is missing or not applied.
