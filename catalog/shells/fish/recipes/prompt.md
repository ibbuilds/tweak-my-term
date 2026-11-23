---
capability: prompt
tool: fish
os: macos, linux
verified: 2026-11-23 (docs, fish 4.9.3 FAQ and tutorial; starship guide)
sources: https://fishshell.com/docs/current/faq.html, https://fishshell.com/docs/current/tutorial.html, https://starship.rs/guide/
---
# Custom or third-party prompt in fish
There is no `PS1`: fish runs the function `fish_prompt` (and optionally `fish_right_prompt`, `fish_mode_prompt`) and displays its output. Save it as `~/.config/fish/functions/fish_prompt.fish`.

## Config
```fish
# ~/.config/fish/functions/fish_prompt.fish
function fish_prompt
    set -l last_status $status                      # capture first
    set_color brblack; echo -n (prompt_pwd)         # abbreviated cwd
    set_color normal
    fish_vcs_prompt                                 # built-in git/hg/svn segment
    if test $last_status -ne 0
        set_color red; echo -n " ✘ $last_status"; set_color normal
    end
    echo
    set_color green; echo -n '❯ '; set_color normal
end
```
```fish
# ~/.config/fish/functions/fish_right_prompt.fish
function fish_right_prompt
    set_color brblack; date +%H:%M; set_color normal
end
```
Pick a ready-made one: `fish_config prompt show`, `fish_config prompt choose <name>`, `fish_config prompt save`.
Third party (in `config.fish`, interactive block):
```fish
starship init fish | source                                # starship.rs
oh-my-posh init fish --config ~/.config/omp.json | source # ohmyposh.dev
```

## Notes
- Capture `$status` on the first line of `fish_prompt`; any command overwrites it.
- Colors: `set_color <name|hex>` (see colors recipe); always reset with `set_color normal`.
- Built-in helpers: `prompt_pwd`, `fish_vcs_prompt` (uses `fish_git_prompt` options such as `set -g __fish_git_prompt_show_informative_status 1`), `prompt_login`.
- `fish_mode_prompt` shows the vi mode (`[I]`); define it empty to hide it (FAQ).
- Multiline prompts are fine; fish redraws them on resize.
- Cost: the prompt runs on every Enter; avoid slow external commands in it (git calls take a few ms on Unix).
- Transient (collapsing) prompts are not a fish core setting in the docs checked; use starship's fish transient support if you need it.
