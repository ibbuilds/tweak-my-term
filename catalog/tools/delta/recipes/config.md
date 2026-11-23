---
capability: config
tool: delta
os: windows, macos, linux
verified: 2026-11-23 (delta 0.21.2 on Windows 11; delta --help read)
sources: https://dandavison.github.io/delta/configuration.html, https://dandavison.github.io/delta/features-named-groups-of-settings.html
---
# delta options: layout, features, navigation

All options go under `[delta]` in git config (names are the CLI flags without `--`). Group them in features to switch whole setups.

## Config
```gitconfig
[delta]
    features = base
    navigate = true            # n/N between files (needs less)
    line-numbers = true
    hyperlinks = true
    hyperlinks-file-link-format = "vscode://file/{path}:{line}"
    file-added-label = [+]
    file-removed-label = [-]
    file-modified-label = [~]
[delta "base"]
    side-by-side = false
    tabs = 4
[delta "wide"]
    side-by-side = true
    line-numbers-left-format = "{nm:>4}|"
    line-numbers-right-format = "{np:>4}|"
```
Switch on demand without editing files: `DELTA_FEATURES=+wide git show`, `DELTA_FEATURES=+ git diff` to undo (docs). Inspect: `delta --show-config`, `delta --list-syntax-themes`, `delta --show-themes`.

## Notes
- `dark = true`/`light = true` pick default diff colors; both omitted means auto-detection by terminal background query.
- Commit decorations, hunk headers and file labels have their own `*-style` and `*-decoration-style` options (see `theme.md` and `delta --help`).
- Side-by-side needs terminal width of about 160 columns to be useful; lazygit supports a width-conditional template (see integration).
- `navigate = true` changes how `less` is invoked (adds keys); it relies on delta driving `less` as the pager (docs describe it as less-based navigation).
