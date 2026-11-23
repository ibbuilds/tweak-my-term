---
capability: profiles
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-dynamic-profiles.html
---
# Profiles in iTerm2 (Dynamic Profiles)
Write a JSON file into `{mac-app-support}/iTerm2/DynamicProfiles/`. iTerm2 watches the folder and loads changes immediately. This is the agent-friendly way to define a whole look; every other iTerm2 recipe here is a set of keys for this file.
## Config
`{mac-app-support}/iTerm2/DynamicProfiles/tweak-my-term.json`:
```json
{
  "Profiles": [
    {
      "Name": "{look.name}",
      "Guid": "{look.guid}",
      "Dynamic Profile Parent Name": "Default"
    }
  ]
}
```
## Notes
- Required keys per profile: `Name` and `Guid` (unique; generate with `uuidgen`). Keep the Guid stable across edits so the profile is updated, not duplicated.
- Unset attributes inherit from the parent (`Dynamic Profile Parent Name`, or the default profile). `Dynamic Profile Parent GUID` (3.4.9+) takes precedence over the name. Parents must load before children (files load alphabetically, profiles in listed order).
- File format is a property list in JSON or XML; no particular extension required. If any file in the folder is malformed, no changes are processed. Errors go to Console.app.
- Edits made in the Settings UI are not written back unless the profile has `"Rewritable": true`.
- Every profile preference can be an attribute. To learn a key name, set it in the UI, then Profiles > Other Actions > Copy Profile as JSON (or export) and read it. This is the fallback for any key marked unverified in these recipes.
- Make it the default profile: set it as default in Settings > Profiles (Other Actions > Set as Default); the `defaults` key for this was not verified.
