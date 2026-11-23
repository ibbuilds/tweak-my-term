---
capability: plugins
tool: zellij
os: windows, macos, linux
verified: 2026-11-23 (docs, zellij 0.46.0)
sources: https://zellij.dev/documentation/plugins.html, https://zellij.dev/documentation/creating-a-layout.html, https://raw.githubusercontent.com/zellij-org/zellij/main/zellij-utils/assets/config/default.kdl
---
# Plugins
Zellij plugins are WebAssembly/WASI modules; Zellij's own UI (tab-bar, status-bar, strider file picker, session-manager, configuration) is built from them. Rust is the officially supported language. There is no package manager: reference a `.wasm` by path or URL.

## Config
Built-in aliases (from the default config, can be overridden or added to):
```kdl
plugins {
    tab-bar location="zellij:bars" { role "tab-bar" }
    status-bar location="zellij:bars" { role "status-bar" }
    compact-bar location="zellij:bars" { role "compact-bar" }
    strider location="zellij:strider"
    session-manager location="zellij:session-manager"
    configuration location="zellij:configuration"
    plugin-manager location="zellij:plugin-manager"
}
// background plugins loaded at session start (restart needed)
load_plugins {
    "zellij:bars" { role "link" }
    // "file:/path/to/my-plugin.wasm"
    // "https://example.com/my-plugin.wasm"
}
```
Use a plugin as a pane in a layout, or bind a key to launch it:
```kdl
layout {
    pane { plugin location="file:/path/to/my-plugin.wasm" }
}
keybinds {
    normal {
        bind "Alt s" { LaunchOrFocusPlugin "session-manager" { floating true; move_to_focused_tab true; } }
    }
}
```
Plugin location forms: `zellij:internal-plugin`, `file:/path/to.wasm`, a URL, or an alias. Zellij prompts for the permissions a plugin requests the first time.

## Notes
- Plugins run sandboxed but can request permissions (run commands, read files, change state): review the source before granting them.
- The Zellij `plugin-manager` built-in lists and manages loaded plugins.
- Other-language plugin support is community-driven: https://zellij.dev/documentation/plugin-other-languages.html
- On Windows, use `file:` paths with forward slashes or a URL.
- tmux equivalent: TPM (git-based shell plugins).
