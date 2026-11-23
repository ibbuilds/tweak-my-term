---
name: status
description: Show where the current tweak-my-term run is (staged, planned, approved, applied, verified, done or failed) and the next step. Use when the user asks about the status, progress or state of their terminal setup or of tweak-my-term.
---

# Status

Run `tmt status` and `tmt runs`. Report the state in one or two plain lines and the next
command. If a run is applied but not verified, run `tmt verify` and `tmt measure` now:
the user expects a finished terminal.
