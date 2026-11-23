---
capability: profiles
tool: gnome-terminal
os: linux
verified: 2026-11-23 (docs, gnome-terminal 3.60.0)
sources: https://wiki.gnome.org/Apps/Terminal/FAQ, https://gitlab.gnome.org/GNOME/gnome-terminal/-/blob/master/src/org.gnome.Terminal.gschema.xml, https://gitlab.gnome.org/chergert/ptyxis
---
# Profiles in GNOME Terminal
Profiles are dconf paths `/org/gnome/terminal/legacy/profiles:/:UUID/`. `org.gnome.Terminal.ProfilesList` holds the list of UUIDs and the default one. There is no profile file; config files do not apply.

## Config
Create a profile, add it to the list and make it default:
```sh
UUID=$(uuidgen)
L=org.gnome.Terminal.ProfilesList
gsettings set $L list "$(gsettings get $L list | sed "s/]$/, '$UUID']/")"
gsettings set $L default "'$UUID'"
P="org.gnome.Terminal.Legacy.Profile:/org/gnome/terminal/legacy/profiles:/:$UUID/"
gsettings set "$P" visible-name "'{look.name}'"
```
Or edit the existing default profile (recommended; keeps the user's other profiles intact):
```sh
UUID=$(gsettings get org.gnome.Terminal.ProfilesList default | tr -d "'")
```
Batch form (every key of a profile at once; file starts with `[/]`):
```sh
dconf load /org/gnome/terminal/legacy/profiles:/:$UUID/ < look.dconf
```

## Notes
- Back up first: `dconf dump /org/gnome/terminal/legacy/ > backup.ini`; restore with `dconf load /org/gnome/terminal/legacy/ < backup.ini`.
- Without a profile `list`, GNOME Terminal creates a default profile on first run; the `dconf` tree can be empty on a fresh account, so open the terminal once before scripting.
- `visible-name` is the label shown in Preferences. Other profile keys are in the other recipes.
- Ptyxis (GNOME's newer terminal, the default on recent Fedora and Ubuntu per distro reports) is a different app: profile UUIDs are under `/org/gnome/Ptyxis/Profiles/UUID/` with keys such as `opacity`, and color palettes are `.palette` INI files in `~/.local/share/org.gnome.Ptyxis/palettes/` (Flatpak: `~/.var/app/app.devsuite.Ptyxis/data/ptyxis/palettes/`). If `gnome-terminal` is not installed, detect `ptyxis` and treat it as a separate catalog entry; do not apply these commands to it.
