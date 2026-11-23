---
capability: layouts
tool: komorebi
os: windows
verified: 2026-11-23 (docs, komorebi v0.1.41)
sources: https://lgug2z.github.io/komorebi/example-configurations.html, https://github.com/LGUG2Z/komorebi/blob/v0.1.41/docs/common-workflows/layout-ratios.md, https://lgug2z.github.io/komorebi/cli/preselect-direction.html
---
# Layouts in komorebi
Each workspace has a `layout`: `BSP`, `VerticalStack`, `HorizontalStack`, `RightMainVerticalStack`, `UltrawideVerticalStack`, `Columns`, `Rows`, `Grid` (and `Scrolling` in recent versions). New windows are placed automatically.

## Config
Terminal on the left, two stacked on the right is the `VerticalStack` layout: first window = main column, every later window stacks in the right column.
```json
{
  "monitors": [
    {
      "workspaces": [
        {
          "name": "term",
          "layout": "VerticalStack",
          "layout_options": { "column_ratios": [0.5], "row_ratios": [0.5] }
        }
      ]
    }
  ]
}
```
BSP alternative, steered from the CLI (new window opens in the preselected direction):
```powershell
komorebic preselect-direction right    # then open terminal 2
komorebic preselect-direction down     # then open terminal 3
komorebic change-layout VerticalStack  # switch the focused workspace live
komorebic flip-layout horizontal       # mirror: main column on the right
```

## Notes
- `column_ratios[0]` is the main column width (0.1 to 0.9); `row_ratios[0]` the first stack row height. The last window takes the remainder.
- With one window the main column fills the screen; the stack appears with the second window.
- Per-workspace `layout_rules` switch layout by window count, e.g. `"layout_rules": { "1": "Columns", "3": "VerticalStack" }`.
- `RightMainVerticalStack` puts the main window on the right, the stack on the left.
