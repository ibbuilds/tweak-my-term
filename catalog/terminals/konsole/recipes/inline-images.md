---
capability: inline-images
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://www.arewesixelyet.com/, https://invent.kde.org/utilities/konsole/-/blob/master/src/profile/Profile.cpp
---
# Inline images in Konsole
Konsole renders Sixel graphics. There is no profile key to set (none exists in Profile.cpp); use a Sixel-capable tool.

## Config
```sh
chafa -f sixel image.png
img2sixel image.png
```

## Notes
- Sixel support is dated to Konsole 22.04 by Are We Sixel Yet (a third-party tracker, not KDE docs); other sources say 24.02. Test with `chafa -f sixel` on the installed version before promising it.
- The kitty graphics protocol and the iTerm2 image protocol were not confirmed. `KittyKeyboardEnabled` in the profile is the kitty keyboard protocol, not images.
- Inside tmux, images need a tmux built with sixel passthrough.
