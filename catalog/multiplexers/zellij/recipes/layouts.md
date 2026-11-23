---
capability: layouts
tool: zellij
os: windows, macos, linux
verified: 2026-11-23 (docs, zellij 0.46.0)
sources: https://zellij.dev/documentation/layouts.html, https://zellij.dev/documentation/creating-a-layout.html
---
# Declarative layouts
Layouts are KDL files: `layout { ... }` containing `pane`, `tab`, `pane_template`, `tab_template`. Zellij loads `layouts/default.kdl` from the config dir by default; start another with `zellij --layout <name-or-path>`.

## Config
```kdl
// ~/.config/zellij/layouts/dev.kdl
layout {
    default_tab_template {
        pane size=1 borderless=true { plugin location="zellij:tab-bar" }
        children
        pane size=2 borderless=true { plugin location="zellij:status-bar" }
    }
    tab name="edit" focus=true {
        pane split_direction="vertical" {
            pane command="nvim" size="70%" {
                args "."
            }
            pane split_direction="horizontal" size="30%" {
                pane
                pane command="git" {
                    args "status"
                }
            }
        }
    }
    tab name="logs" cwd="/var/log" {
        pane command="tail" {
            args "-f" "syslog"
        }
    }
    floating_panes {
        pane { x "10%" y "10%" width "80%" height "70%" }
    }
}
```
```sh
zellij --layout dev                       # name in the layouts dir
zellij --layout ./dev.kdl                 # path
zellij --layout dev                       # inside a session: opens as new tab(s)
zellij action override-layout ./other.kdl # rearrange the current tab at runtime
zellij setup --dump-layout default        # print a bundled layout to start from
```
Pane attributes: `split_direction "vertical"|"horizontal"`, `size` (number or percent), `borderless`, `name`, `command`/`args`/`cwd`, `edit "<file>"`, `plugin location=...`, `stacked`, `focus`. Make a layout the default: `default_layout "dev"` in `config.kdl`. Swap layouts (`swap_tiled_layout`/`swap_floating_layout` blocks) change arrangement as pane count changes.

## Notes
- Windows: use Windows executables in `command` (`pwsh`, `nvim`), and forward slashes or escaped backslashes in `cwd`.
- Remote layouts (`--layout https://...`) suspend every command behind a "Waiting to run" banner for safety.
- Sessions can be serialized and resurrected (`session_serialization` default true).
- Compared with tmux: layouts are declarative files instead of command scripts.
