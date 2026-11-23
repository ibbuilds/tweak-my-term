---
capability: prompt
tool: nushell
os: windows, macos, linux
verified: 2026-11-23 (docs, Nushell book "Coloring and Theming", "How to Configure 3rd Party Prompts", v0.117)
sources: https://www.nushell.sh/book/coloring_and_theming.html, https://www.nushell.sh/book/3rdpartyprompts.html, https://www.nushell.sh/book/special_variables.html
---
# Custom or third-party prompt in nushell
The prompt is made of environment variables holding strings or closures that Nushell evaluates every time the prompt is drawn. Transient prompts are native.

## Config
Own prompt in `config.nu`:
```nu
$env.PROMPT_COMMAND = {||
  let dir = ($env.PWD | str replace $nu.home-dir "~")
  let code = if $env.LAST_EXIT_CODE != 0 { $" (ansi red)✘ ($env.LAST_EXIT_CODE)(ansi reset)" } else { "" }
  $"(ansi dark_gray)($dir)(ansi reset)($code)"
}
$env.PROMPT_COMMAND_RIGHT = {|| $"(ansi dark_gray)(date now | format date '%H:%M')(ansi reset)" }
$env.PROMPT_INDICATOR = {|| $"(ansi green)❯(ansi reset) " }
$env.PROMPT_INDICATOR_VI_INSERT = ": "
$env.PROMPT_INDICATOR_VI_NORMAL = "> "
$env.PROMPT_MULTILINE_INDICATOR = "::: "

# transient prompt: how past prompts are shown
$env.TRANSIENT_PROMPT_COMMAND = ""            # no left prompt on old lines, indicator only
$env.TRANSIENT_PROMPT_COMMAND_RIGHT = ""
```
Third party (write the init script once into a vendor autoload dir; Nushell loads it after `config.nu`):
```nu
mkdir ($nu.data-dir | path join "vendor/autoload")
starship init nu | save -f ($nu.data-dir | path join "vendor/autoload/starship.nu")
oh-my-posh init nu --config ~/.poshthemes/M365Princess.omp.json    # writes oh-my-posh.nu into a vendor autoload dir
```

## Notes
- Variables (docs): `PROMPT_COMMAND`, `PROMPT_COMMAND_RIGHT`, `PROMPT_INDICATOR`, `PROMPT_INDICATOR_VI_INSERT`, `PROMPT_INDICATOR_VI_NORMAL`, `PROMPT_MULTILINE_INDICATOR`; each has a `TRANSIENT_PROMPT_*` twin. Unset a transient override with `hide-env TRANSIENT_PROMPT_COMMAND`.
- Use `$env.LAST_EXIT_CODE` and `$env.CMD_DURATION_MS` (set by Nushell) in prompt closures.
- The config item `render_right_prompt_on_last_line` (bool, see the book's prompt section) moves the right prompt to the last line of a multi-line prompt.
- Starship needs no extra variables in recent versions; for manual setups the book's example sets `STARSHIP_SHELL = "nu"` and `PROMPT_COMMAND` to a closure calling `starship prompt --cmd-duration $env.CMD_DURATION_MS $'--status=($env.LAST_EXIT_CODE)'`.
- Cost: the closure runs on every prompt in-process; calling `git` inside it spawns a process each time (10-60 ms on Windows). Prefer starship/oh-my-posh, which cache or are optimised.
- Do not `source` a file written in the same run (parse-time constant); use the autoload dir as above.
