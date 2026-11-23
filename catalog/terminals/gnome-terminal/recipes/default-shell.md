---
capability: default-shell
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml
---
# Default shell in GNOME Terminal
By default the terminal runs the user's login shell from the account. To run something else, enable a custom command on the profile.

## Config
```sh
UUID=$(gsettings get org.gnome.Terminal.ProfilesList default | tr -d "'")
PROFILE="org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:$UUID/"
gsettings set "$PROFILE" use-custom-command true
gsettings set "$PROFILE" custom-command "'/usr/bin/zsh'"
gsettings set "$PROFILE" login-shell true
```
Back to the account shell: `gsettings set "$PROFILE" use-custom-command false`.

## Notes
- `custom-command` replaces the shell; arguments are part of the same string (quoting rules of the command parser were not verified, so prefer a plain path).
- `login-shell` (default false) starts the command as a login shell (argv[0] gets a leading hyphen).
- To change the account's login shell instead, use `chsh -s /usr/bin/zsh`.
- `exit-action` (`close` default, `restart`, `hold`) controls what happens when the command exits; use `hold` to keep the error visible while debugging.
