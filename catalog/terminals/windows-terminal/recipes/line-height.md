---
capability: line-height
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://github.com/microsoft/terminal/blob/main/doc/cascadia/profiles.schema.json
---
# Line height in Windows Terminal
`font.cellHeight` overrides the cell height like CSS `line-height`. A unitless number is a multiplier of the font size; the default is the font's natural height, usually close to 1.2.

## Config
```jsonc
"font": {
  "face": "{font.family}",
  "cellHeight": "{font.lineHeight}"
}
```

## Notes
- The value is a CSS length or percentage string (schema type `CSSLengthPercentage`); the verified Eclipse preset uses a quoted multiplier (`"1.25"`). Pixel and percentage strings are also accepted per the schema.
- `font.cellWidth` is the matching letter-spacing override.
- `cellHeight` is documented in the JSON schema, not in the learn.microsoft.com profile pages.
- Large values leave gaps between box-drawing characters in TUIs; 1.1 to 1.3 reads well with background art.
