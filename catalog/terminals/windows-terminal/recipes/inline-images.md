---
capability: inline-images
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://github.com/microsoft/terminal/issues?q=sixel
---
# Inline images in Windows Terminal
Windows Terminal renders Sixel graphics. It does not implement the iTerm2 inline-image protocol or the Kitty graphics protocol, so tools must be told to use Sixel.

## Config
No setting. Tools with a protocol switch need it set explicitly, for example fastfetch (`"type": "sixel"` in its logo section; do not use `"auto"`), `chafa -f sixels`, `img2sixel`, `lsix`.

## Notes
- Sixel support landed during 2025 (Windows Terminal 1.22 era; exact version unverified here); active sixel fixes were merged in 2026, so the installed 1.25 stable has it.
- Large Sixel images are slow; keep them small. Images do not reflow on resize.
- No configuration key exists for image size limits or protocols.
- Support depends on the installed release channel; check with an image tool before relying on it in a config.
