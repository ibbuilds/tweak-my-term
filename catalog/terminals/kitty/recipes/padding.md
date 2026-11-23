---
capability: padding
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/conf/
---
# Padding in kitty
`window_padding_width` is in points; one to four values.
## Config
```
# look padding = [top, right, bottom, left]  ->  top right bottom left
window_padding_width {padding.top} {padding.right} {padding.bottom} {padding.left}
```
## Notes
- Forms: 1 value all sides; 2 values vertical horizontal; 3 values top, horizontal, bottom; 4 values top right bottom left. Default 0.
- `background_tint_gaps` (default 1.0) multiplies the tint applied at window gaps when a background image is set.
