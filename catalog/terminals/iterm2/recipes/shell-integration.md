---
capability: shell-integration
tool: iterm2
os: macos
verified: 2026-11-23 (docs, iTerm2 3.7.9)
sources: https://iterm2.com/documentation-shell-integration.html, https://iterm2.com/documentation-escape-codes.html
---
# Shell integration in iTerm2
Supported for bash, zsh, fish (2.3+), tcsh and xonsh (3.6.10+). It adds prompt marks, command status, cwd and host tracking.
## Config
```
# zsh, manual:
curl -L https://iterm2.com/shell_integration/zsh -o ~/.iterm2_shell_integration.zsh
echo 'source ~/.iterm2_shell_integration.zsh' >> ~/.zshrc
# all shells, scripted installer:
curl -L https://iterm2.com/shell_integration/install_shell_integration.sh | bash
```
## Notes
- 3.5+: Settings > Profiles > General > "Load shell integration automatically" works when Command is SSH or a supported login shell, no dotfile edit needed.
- Other shells write `~/.iterm2_shell_integration.bash` or `~/.config/xonsh/rc.d/iterm2.xsh`.
- Marks use OSC 133 (A prompt start, B command start, C executing, D finished with status); also OSC 1337 `CurrentDir`, `RemoteHost`; OSC 7 works for cwd.
- Features: marks (Cmd+Shift+Up/Down), red mark on failure, command history and recent directories, scp download, automatic profile switching by user/host.
- Piping scripts from the network into bash is a security risk; prefer downloading and reading the script first.
