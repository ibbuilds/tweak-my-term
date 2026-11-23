---
capability: shell-integration
tool: ghostty
os: macos, linux
verified: 2026-11-23 (docs, ghostty 1.4)
sources: https://ghostty.org/docs/features/shell-integration, https://ghostty.org/docs/config/reference
---
# Shell integration in Ghostty
Ghostty injects integration automatically for bash, zsh, fish, elvish and nushell (default `shell-integration = detect`). It gives prompt marking, cwd tracking, and cursor/title handling.
## Config
```
shell-integration = detect
shell-integration-features = cursor,title,path
# opt-in wrappers, off by default: sudo, ssh-env, ssh-terminfo (the ssh-* ones since 1.2.0)
```
## Notes
- Values: `none`, `detect`, `bash`, `elvish`, `fish`, `nushell`, `zsh`. Features: `cursor`, `sudo`, `title`, `ssh-env`, `ssh-terminfo`, `path`; the `no-<feature>` form (for example `no-cursor`) is the documented way to disable one, but the pages read here did not show it, so verify with `ghostty +show-config --default --docs`.
- macOS `/bin/bash` does not support automatic injection: source the script manually or use a Homebrew bash.
- Manual setup is needed when you switch shells inside Ghostty. Guard with `GHOSTTY_RESOURCES_DIR`, for example at the top of `~/.bashrc`:
  `[ -n "${GHOSTTY_RESOURCES_DIR}" ] && builtin source "${GHOSTTY_RESOURCES_DIR}/shell-integration/bash/ghostty.bash"`
  Other scripts under that dir: `zsh/ghostty-integration`, `fish/vendor_conf.d/ghostty-shell-integration.fish`, `elvish/lib/ghostty-integration.elv`, `nushell/vendor/autoload/ghostty.nu`.
- Fish 4.0+ has native prompt marking.
