---
capability: inline-images
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-images.html, https://iterm2.com/documentation-escape-codes.html
---
# Inline images in iTerm2
`imgcat` and the `OSC 1337 ; File=` escape display images inline. The Kitty graphics protocol is also supported. Sixel is not mentioned in the docs read.
## Config
```
# no config required
imgcat path/to/image.png
# raw: ESC ] 1337 ; File=inline=1;width=auto;preserveAspectRatio=1 : <base64> BEL
```
## Notes
- Any macOS-readable image format works (PNG, GIF incl. animated, PDF, ...). Without `inline=1` the file is saved to Downloads instead.
- tmux: older tmux limits a sequence to 256 bytes; iTerm2 3.5 added a multipart method (`MultipartFile`, `FilePart`, `FileEnd`) that works in tmux integration mode. iTerm2 itself caps a sequence at 1,048,576 bytes.
- Kitty protocol uses APC G sequences; tools like `kitten icat` or `chafa -f kitty` should work.
