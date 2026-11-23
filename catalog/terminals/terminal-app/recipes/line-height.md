---
capability: line-height
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/en-ca/guide/terminal/trmltxt/mac, https://stackoverflow.com/questions/79814720/change-macos-terminal-theme-background-colour-programatically
---
# Line height in Terminal
Profiles carry `FontWidthSpacing` (real, 1.0 = normal; seen in profile dumps). A matching `FontHeightSpacing` key for line spacing is expected but was not seen in any source read, so treat it as unverified.

## Config
```sh
f="{look.name}.terminal"
plutil -insert FontHeightSpacing -float {font.lineHeight} "$f"   # key name unverified
```

## Notes
- Check it in Settings > Profiles > Text after import: if the line spacing slider did not move, the key name is wrong; set it once in the UI, export the profile and copy the key.
- Character spacing is `FontWidthSpacing` in the same way.
- This is why line-height is `partial` for Terminal.
