---
capability: gaps
tool: komorebi
os: windows
verified: 2026-11-23 (docs, komorebi v0.1.41)
sources: https://lgug2z.github.io/komorebi/example-configurations.html, https://lgug2z.github.io/komorebi/common-workflows/remove-gaps.html, https://github.com/LGUG2Z/komorebi/blob/v0.1.41/komorebi-layouts/src/rect.rs
---
# Gaps in komorebi
Two paddings: `default_workspace_padding` (between the outer windows and the screen edge) and `default_container_padding` (around each tiled window). Both can be overridden per monitor or workspace.

## Config
For one uniform gap `G` (here 16px), use half of `G` for both:
```json
{
  "default_workspace_padding": 8,
  "default_container_padding": 8
}
```
Per-workspace override:
```json
{ "monitors": [ { "workspaces": [ { "name": "term", "workspace_padding": 8, "container_padding": 8 } ] } ] }
```

## Notes
- Container padding is applied on all four sides of every window (checked in the v0.1.41 source: `Rect::add_padding`). Two neighbours are therefore `2 x container_padding` apart, and a window touching the screen edge is `workspace_padding + container_padding` away. That is why both values are `G / 2` for a uniform gap `G`.
- No gaps at all: `"default_workspace_padding": 0` and `"default_container_padding": -1` (documented remove-gaps recipe).
- With the status bar, add its height with `global_work_area_offset` (`{ "left": 0, "top": 40, "right": 0, "bottom": 40 }`; `right` and `bottom` are the total amount removed from width and height) or per monitor with `work_area_offset`. The offset semantics come from the schema; check them visually.
- Changes to komorebi.json apply on save (see the config-reload recipe).
