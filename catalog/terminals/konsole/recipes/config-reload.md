---
capability: config-reload
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://lxr.kde.org/source/utilities/konsole/tools/konsoleprofile, https://docs.kde.org/stable_kf6/en/konsole/konsole/commandreference.html
---
# Config reload in Konsole
No automatic file watcher was documented. New windows read edited profile and color scheme files; open tabs keep what they loaded. Changes can be pushed to the current tab live.

## Config
```sh
# from inside a Konsole tab; applies to that tab only and is not saved to disk
konsoleprofile "ColorScheme={look.name}"
konsoleprofile "ColorScheme={look.name};TabColor=#aabbcc"
# switch the profile of the current session over D-Bus
qdbus $KONSOLE_DBUS_SERVICE $KONSOLE_DBUS_SESSION org.kde.konsole.Session.setProfile "{look.name}"
```

## Notes
- `konsoleprofile` prints an OSC 50 escape, so it works only when run inside the Konsole tab you want to change. `konsole --list-profile-properties` lists valid keys.
- Settings > Switch Profile does the same from the menu.
- The qdbus form comes from KDE user threads, not the handbook; the tool may be named `qdbus6` on Qt6 systems.
- A changed `DefaultProfile` in konsolerc is not applied to a running Konsole; restart it.
