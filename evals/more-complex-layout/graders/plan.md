---
type: llm
---
PASS if the reply (1) links at least two real examples, (2) proposes a multi-pane layout of about 3 to 6 panes where the user's working shell or editor is the largest pane, (3) only uses tools available on Windows for the panes (for example btop, fastfetch, cava, clock-tui, pipes-rs, rusty-rain, yazi, lazygit; not tty-clock, cmatrix, cbonsai or pipes.sh), (4) makes it open that way automatically (Windows Terminal startupActions or a startup layout), and (5) does not claim anything was changed.
FAIL if any of those is missing.
