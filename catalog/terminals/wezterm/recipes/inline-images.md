---
capability: inline-images
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/imgcat.html
---
# Inline images in WezTerm
WezTerm implements the iTerm2 inline images protocol and ships `wezterm imgcat` to display an image in the terminal. Tools that speak the iTerm2 protocol (fastfetch, many image viewers) work out of the box.

## Config
No config needed. Try it:
```bash
wezterm imgcat /path/to/image.png
```
`doNotMoveCursor=1` as an argument of the `File` escape sequence keeps the cursor in place (since 20220319-142410-0fcdea07).

## Notes
- Animated GIF and PNG shown through `imgcat` animate while the window has focus.
- The docs state that the image protocol is not fully handled by multiplexer sessions (SSH/TLS domains).
- Sixel is parsed by WezTerm (changelog entries exist) and Kitty graphics is mentioned for "nightly builds" by third-party tools; support level in stable 20240203 is not confirmed here. When a tool offers a choice, pick the iTerm2 protocol for WezTerm.
- Images inside tmux need passthrough; not verified here.
