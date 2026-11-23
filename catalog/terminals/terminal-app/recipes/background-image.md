---
capability: background-image
tool: terminal-app
os: macos
verified: 2026-11-23 (docs, Terminal User Guide 2026)
sources: https://support.apple.com/en-ca/guide/terminal/trmltxt/mac
---
# Background image in Terminal
Settings > Profiles > Text > Background > Image > Choose... sets an image for the profile (User Guide). The profile key that stores it was not found in any source read, so this cannot be scripted reliably.

## Config
Manual path for the user (give them these steps):
1. Open Terminal > Settings > Profiles, select `{look.name}` (imported first).
2. Text tab > Background > Image pop-up > Choose, pick `{background.image}`.
3. Check readability; lower the background color opacity if needed.

To script it later: do step 2 once, export the profile (Action menu > Export), read the new key name from the file with `plutil -p`, then add it to the generated .terminal file.

## Notes
- No fit/tile/align controls are documented; the image is drawn as Terminal decides.
- Use a copy of the image in a stable folder (for example `~/Pictures`); moving the original breaks the reference.
- Static images only.
