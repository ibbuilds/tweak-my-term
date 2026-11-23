---
description: End to end in a sandbox - apply the quiet preset through the gated flow. Needs shell grants (Linux/macOS sandbox or WSL2), run with --tag e2e --allow-tools "Bash(tmt *)" "Bash(node *)".
tags: [e2e]
runs: 1
max_turns: 40
timeout_seconds: 900
allowed_tools: [Skill, Read, Glob, Grep]
---
Apply the "quiet" terminal preset for me. I approve the plan in advance and I don't want any package installs, just the config files.
