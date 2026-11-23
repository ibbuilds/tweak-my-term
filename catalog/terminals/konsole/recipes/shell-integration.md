---
capability: shell-integration
tool: konsole
os: linux
verified: 2026-11-23 (docs, konsole 26.08)
sources: https://docs.kde.org/stable_kf6/en/konsole/konsole/commandreference.html, https://invent.kde.org/utilities/konsole/-/blob/master/src/Enumeration.h
---
# Shell integration in Konsole
Konsole understands semantic prompt marks emitted by the shell: the handbook says "Monitor for Prompt" appears only when semantic integration is enabled in the shell. The visual side is the profile key `SemanticHints`.

## Config
```ini
[General]
# 0 never, 1 only with URLs, 2 always (lines between commands, lighter input text)
SemanticHints=2
SemanticUpDown=false
SemanticInputClick=false
```

## Notes
- The shell must emit the marks itself (OSC 133 prompt markers); Konsole does not install a shell script. Which shells and prompt tools emit them was not verified here.
- `SemanticUpDown` makes Up/Down move between prompts; `SemanticInputClick` lets a click position the input cursor.
- The key names and the 0/1/2 meaning come from the Konsole source (Profile.cpp, Enumeration.h), not from the handbook.
