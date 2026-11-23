---
capability: layouts
tool: glazewm
os: windows
verified: 2026-11-23 (docs, glazewm v3.10.1)
sources: https://github.com/glzr-io/glazewm#faq, https://github.com/glzr-io/glazewm/blob/main/packages/wm-common/src/app_command.rs
---
# Layouts in GlazeWM
There are no named layouts. Windows form a tree of horizontal and vertical splits. The tiling direction of the focused window decides where the next window opens: horizontal = to its right, vertical = below it.

## Config
Terminal on the left, two stacked on the right (done by hand, once per workspace):
```text
1. Open terminal A.                                   A
2. Open terminal B (direction horizontal)             A | B
3. With B focused press alt+v (toggle-tiling-direction)
4. Open terminal C                                    A | B
                                                          C
5. Resize if needed (resize --width +2%).
```
```yaml
keybindings:
  - commands: ['toggle-tiling-direction']
    bindings: ['alt+v']
  - commands: ['set-tiling-direction vertical']   # explicit form
    bindings: ['alt+shift+v']
```
Read the current direction: `glazewm query tiling-direction`.

## Notes
- Moving a window follows the same rule: it lands to the right of or below the window it is moved onto, according to that window's direction.
- A script can reproduce the layout with `glazewm command set-tiling-direction vertical` between window launches. Waiting for each window to appear is the script's job; the docs do not cover this flow.
- No automatic layouts (BSP/spiral) natively; community scripts such as GAT-GWM flip the direction automatically.
- Resize with `resize --width +2%` / `--height -2%`, or enable the `resize` binding mode (`alt+r` in the generated config).
