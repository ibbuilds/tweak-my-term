---
capability: autostart
tool: sway
os: linux
verified: 2026-11-23 (docs, sway 1.12)
sources: https://man.archlinux.org/man/sway.5
---
# Autostart in sway
`exec <shell command>` runs the command with `sh` once at startup. `exec_always <shell command>` runs it at startup and again after every `reload`.

## Config
Open a terminal on the left and two stacked on the right at login:
```
exec foot
exec sh -c 'sleep 0.4; foot'
exec sh -c 'sleep 0.8; swaymsg splitv; foot'
```
Windows open focused, so the third `foot` opens below the second after `splitv`.

## Notes
- Use `exec`, not `exec_always`, for terminals: otherwise each reload opens more windows.
- The `sleep` delays keep the spawn order stable; the values are a practical choice, not documented ones. A single script launched from `exec` is easier to adjust.
- Pin a terminal to a workspace with `assign [app_id="foot"] → workspace number 1` rather than relying on timing across workspaces.
- Daemons such as a bar or notifier go in the same section; list every autostarted command in the plan.
- Under a display manager or systemd user session, `exec` lines still run from the sway config.
