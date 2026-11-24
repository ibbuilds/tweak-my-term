---
capability: opacity
tool: guake
os: linux
verified: 2026-11-23 (docs, Guake 3.10.1)
sources: https://github.com/Guake/guake/blob/master/guake/data/org.guake.gschema.xml, https://github.com/Guake/guake/blob/master/guake/guake_app.py
---
# Window opacity in Guake
`guake.style.background transparency` is an integer 0 to 100 (default 90) applied as the alpha of the terminal background (alpha = transparency / 100). Text stays opaque.

## Config
```sh
gsettings set guake.style.background transparency "$(awk 'BEGIN { printf "%d", {window.opacity} * 100 + 0.5 }')"
```

## Notes
- The token `{window.opacity}` is a 0 to 1 fraction; the awk line converts it to the 0 to 100 integer the schema wants (for example 0.85 becomes 85). Write the integer directly when it is already known.
- Guake needs a compositing desktop; without one it logs "System doesn't support transparency" and ignores the key (guake_app.py).
- The `toggle-transparency` and `increase-transparency` / `decrease-transparency` local shortcuts change it at runtime; a toggled-off state renders alpha 1.
- There is no blur key.
