---
capability: completion
tool: bash
os: windows, macos, linux
verified: 2026-11-23 (machine for the lazy git-completion pattern on Git for Windows; docs for bash-completion packages)
sources: https://www.gnu.org/software/bash/manual/html_node/Programmable-Completion, https://github.com/scop/bash-completion
---
# Completion in bash
Readline handles file completion; programmable completion (`complete`, `compgen`) adds per-command rules. The `bash-completion` package supplies rules for hundreds of tools; Git for Windows ships git's own.

## Config
Linux, and macOS with `brew install bash bash-completion@2` (needs bash 4.2+):
```bash
# apt/dnf/pacman package: bash-completion
[ -r /usr/share/bash-completion/bash_completion ] && . /usr/share/bash-completion/bash_completion
# macOS (Homebrew): [ -r "$(brew --prefix)/etc/profile.d/bash_completion.sh" ] && . "$(brew --prefix)/etc/profile.d/bash_completion.sh"
```
Lazy-load an expensive completion script on the first Tab (Git Bash example; saves ~30 ms at startup):
```bash
_lazy_git() {
  . /mingw64/share/git/completion/git-completion.bash || return 1
  complete -o bashdefault -o default -o nospace -F __git_wrap__git_main git g
  return 124                      # tell bash to retry completion with the new function
}
complete -o bashdefault -o default -o nospace -F _lazy_git git g
```
Tool-provided scripts, ideally cached to a file: `source <(pnpm completion bash)`, `source <(kubectl completion bash)`.

## Notes
- Display behavior (case-insensitive, one Tab lists, menu cycling) lives in `~/.inputrc`, see line-editing; `TAB: menu-complete` cycles instead of listing.
- `complete -p` lists current rules; `complete -r cmd` removes one; `complete -d cd` makes `cd` complete directories only.
- Sourcing the main `bash-completion` script costs ~10-30 ms on Linux and more on Windows (many forks). It lazy-loads per-command files on first Tab, so source only the main script.
- Returning 124 from a `complete -F` function makes bash re-run completion (documented in the Bash manual under Programmable Completion).
