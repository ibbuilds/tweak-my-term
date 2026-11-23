---
capability: install-init
tool: zsh-autosuggestions
os: macos, linux
verified: 2026-11-23 (docs, zsh-autosuggestions 0.7.1)
sources: https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/master/INSTALL.md, https://raw.githubusercontent.com/zsh-users/zsh-autosuggestions/master/README.md
---
# Install zsh-autosuggestions
Install the package (or clone the repo) and `source` its script from `~/.zshrc`. Not available on native Windows: it needs zsh (WSL, MSYS2).

## Config
```zsh
# macOS (Homebrew): brew install zsh-autosuggestions
source $(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh

# Arch: pacman -S zsh-autosuggestions
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh

# Debian/Ubuntu/Fedora packages (path per distro packaging, not re-verified here)
source /usr/share/zsh-autosuggestions/zsh-autosuggestions.zsh

# Manual clone (any OS with zsh)
#   git clone https://github.com/zsh-users/zsh-autosuggestions ~/.zsh/zsh-autosuggestions
source ~/.zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
```
Oh My Zsh: `git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`, then add `zsh-autosuggestions` to `plugins=( ... )`. Antigen: `antigen bundle zsh-users/zsh-autosuggestions`.

## Notes
- Source it AFTER `compinit` and after anything that rebinds keys; if combined with zsh-syntax-highlighting, syntax-highlighting must be sourced last (see that entry).
- Requires zsh 4.3.11+; asynchronous fetching needs 5.0.8+ (default on).
- Restart the shell (`exec zsh`) after editing `~/.zshrc`; widgets are re-bound on every prompt unless `ZSH_AUTOSUGGEST_MANUAL_REBIND` is set.
- Uninstall: remove the source line and delete the clone.
