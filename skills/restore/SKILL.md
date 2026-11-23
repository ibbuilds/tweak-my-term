---
name: restore
description: Undo a tweak-my-term change - restores every file a run wrote byte-for-byte from its backup and removes files it created and fonts it installed. Use when the user wants to undo, revert, roll back or remove a terminal change, or go back to how it was.
argument-hint: "[run id]"
---

# Undo a run

Run: $ARGUMENTS

1. `tmt runs` lists runs and their status. With no id, the latest applied run is the
   likely target; confirm which one with the user.
2. Explain what restore does: each file goes back to how it was before that run, files
   the run created are deleted, fonts it installed are removed. Packages it installed
   stay; list them with their uninstall commands if the user wants them gone.
3. `tmt restore <run-id>`. If it reports files changed after the run, a copy of their
   current versions is kept in the run's `pre-restore/` folder; say so.
4. Ask the user to open a new terminal window to see the previous look.
