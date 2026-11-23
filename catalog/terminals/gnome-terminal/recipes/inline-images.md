---
capability: inline-images
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Inline images in GNOME Terminal
Sixel images are available behind a profile key, off by default (it needs a VTE built with sixel support, which the schema key implies for 3.60).

## Config
```sh
UUID=$(gsettings get org.gnome.Terminal.ProfilesList default | tr -d "'")
PROFILE="org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:$UUID/"
gsettings set "$PROFILE" enable-sixel true
# test
chafa -f sixel image.png
```

## Notes
- Only Sixel; the kitty and iTerm2 image protocols are not mentioned in the schema.
- If the key does not exist (`No such key`), the installed GNOME Terminal is older than the one this entry was read from; use another terminal for images.
- Distros may build VTE without sixel; confirm with the test above.
