---
capability: config-reload
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-dynamic-profiles.html
---
# Config reload in iTerm2
Dynamic Profiles are watched: "Changes are picked up immediately". No reload action is needed.
## Config
```
# write or edit {mac-app-support}/iTerm2/DynamicProfiles/<file>.json ; iTerm2 reloads the whole folder
# tmt verify parses the JSON; plutil -lint rejects JSON Dynamic Profiles (seen in CI), so do not use it here
```
## Notes
- Any change in the folder reloads all files in it. A malformed file stops processing for every file; `tmt verify` parses each JSON file it writes. Errors appear in Console.app.
- Open sessions keep their profile; the updated attributes apply to open sessions of that profile in most cases, new sessions always use the new values (live-update behavior per attribute was not verified).
- Settings > General > Settings can load preferences from a custom folder; not covered here.
