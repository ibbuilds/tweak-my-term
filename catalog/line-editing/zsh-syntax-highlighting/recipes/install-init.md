---
capability: install-init
tool: zsh-syntax-highlighting
os: macos, linux
verified: 2026-11-23 (docs, zsh-syntax-highlighting 0.8.0)
sources: https://raw.githubusercontent.com/zsh-users/zsh-syntax-highlighting/master/INSTALL.md
---
# Install zsh-syntax-highlighting
Install the package (or clone) and `source` the script as the LAST line of `~/.zshrc`. Not available on native Windows (needs zsh: WSL or MSYS2).

## Config
```zsh
# macOS: brew install zsh-syntax-highlighting
source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Debian/Ubuntu/Fedora packages
source /usr/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Arch
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Manual: git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.zsh/zsh-syntax-highlighting
source ~/.zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```
Oh My Zsh: `git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting` and list `zsh-syntax-highlighting` LAST in `plugins=( ... )`. System-wide from a checkout: `make install`, then source `/usr/local/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh`.

## Notes
- Order matters: it wraps ZLE widgets, so every other widget-binding plugin (zsh-autosuggestions, atuin, fzf bindings) must be sourced before it.
- Restart zsh after editing (`exec zsh`).
- Only the `main` highlighter is on by default; see the highlighting recipe to add `brackets`, `pattern`, `cursor`, `regexp`, `root`, `line`.
- Uninstall: delete the source line and the clone.
