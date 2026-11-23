---
capability: inline-images
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/features, https://ghostty.org/docs/about
---
# Inline images in Ghostty
Ghostty implements the Kitty graphics protocol, so tools in kitty mode (`kitten icat`, `chafa -f kitty`, `yazi`, `timg -pk`) display images. Nothing to configure.
## Config
```
# no config required: Kitty graphics protocol is built in
```
## Notes
- Sixel and the iTerm2 inline image protocol are not documented as supported; use the tool's kitty output mode.
- Inside tmux, images need `set -g allow-passthrough on` (tmux behavior; not verified for Ghostty specifically).
- Image storage limits were not verified.
