---
capability: tabs
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://invent.kde.org/utilities/konsole/-/blob/master/src/settings/konsole.kcfg, https://docs.kde.org/stable_kf6/en/konsole/konsole/command-line-options.html
---
# Tabs in Konsole
Tabs are built in. Visibility and position are global settings in `~/.config/konsolerc` `[TabBar]`, not profile keys.

## Config
```sh
# look tabs: always -> 0, auto -> 1, hidden -> 2 (order of AlwaysShowTabBar, ShowTabBarWhenNeeded, AlwaysHideTabBar)
kwriteconfig6 --file konsolerc --group TabBar --key TabBarVisibility 1
# position: Top 0, Bottom 1, Left 2, Right 3
kwriteconfig6 --file konsolerc --group TabBar --key TabBarPosition 0
```
Per profile, an optional tab color: `TabColor={palette.accent}` under `[Appearance]` in the .profile.

## Notes
- The integer storage form is inferred from the kcfg schema (choices listed in that order), not from an on-disk sample. Confirm with `kreadconfig6 --file konsolerc --group TabBar --key TabBarVisibility` after changing it in the UI once.
- One-off: `konsole --show-tabbar` / `--hide-tabbar`.
- `[TabBar] TabBarStyleSheet` (Qt style sheet, default `QTabBar::tab { min-width: 2em ; max-width: 25em }`) styles the bar when `TabBarUseUserStyleSheet` is true.
- Handbook keys: Shift+Left/Right switch tabs, Ctrl+Alt+Left/Right move a tab.
- Tab title: profile `LocalTabTitleFormat` (default `%d : %n`).
