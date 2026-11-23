---
capability: inline-images
tool: foot
os: linux
verified: 2026-11-23 (docs, foot 1.28)
sources: https://codeberg.org/dnkl/foot/raw/branch/master/foot.ini, https://man.archlinux.org/man/foot.ini.5
---
# Inline images in foot
Foot supports sixel graphics, on by default. Use sixel-capable tools: `img2sixel`, `chafa -f sixels`, `timg -ps`, `lsix`.
## Config
```ini
[tweak]
sixel=yes
```
## Notes
- `[tweak]` options may change or disappear without notice; `sixel` defaults to yes so it normally needs no config.
- The sixel color palette slots are `sixel0`-`sixel15` in the colors sections.
- The kitty graphics protocol and the iTerm2 image protocol are not documented for foot; use sixel output modes.
- tmux needs sixel support compiled in (tmux 3.4 with sixel enabled); not verified here.
