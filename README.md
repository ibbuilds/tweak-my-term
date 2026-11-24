# tweak-my-term

Tell your AI agent what you want your terminal to look like ("like this picture",
"something calm and fast", "show me options") and it builds it on **Windows, macOS or
Linux**: colors, font, background image, prompt, layout, fetch art and CLI tools. Every
change comes with a preview, a diff you approve, checks, startup timing, and a one-command
undo.

There are no ready-made looks in here. What it gives the agent is what separates a great
terminal from a themed default, and the means to build one for you:

- **References.** 4,000+ real r/unixporn setups, searched by style (mood, scheme, tool)
  and by layout (tiling, floating, panes, dashboard, scrolling). The agent looks at the
  screenshots and judges the terminal inside each desktop, not the metadata.
- **Design knowledge.** A guide distilled from studying real setups: palette discipline,
  spacing, type, prompt, composition over images, common mistakes, and a critique
  checklist the agent uses on its own result.
- **Tools that adapt.** Palettes from your image, contrast fixing, backgrounds shaded only
  where text needs it, generated art, and an HTML preview of the look and pane layout.
- **Per-OS recipes** for terminals, shells, prompts, multiplexers, window managers and CLI
  tools on Windows, macOS and Linux, with the date and source each was verified against.
- **An apply engine** that cannot write anything you didn't approve, and undoes it all.

## Install (Claude Code plugin)

```
/plugin install tweak-my-term --marketplace ibbuilds/tweak-my-term
```

(Older Claude Code: `/plugin marketplace add ibbuilds/tweak-my-term`, then
`/plugin install tweak-my-term@tweak-my-term`.)

Then just ask: *"make my terminal look like this"* (attach an image), *"show me some
terminal setups"*, *"why is my shell slow?"*, *"undo that"*.

Needs [Node.js](https://nodejs.org) 20 or newer. No npm packages are installed.

**Other agents** (Codex, Cursor, Gemini CLI, ...): clone the repo and point the agent at
[`AGENTS.md`](AGENTS.md). The same CLI runs as `node engine/cli.js`.

## How it builds a terminal

| Stage | What happens |
|---|---|
| Detect | OS, terminals, shells, prompt tools, fonts, existing configs, startup times |
| Audit | reads today's look (colors, font, padding, prompt, panes) and sorts it into keep / improve / missing, so a restyle keeps what works |
| Brief | what you want, what must keep working, whether installs are OK |
| Inspire | real setups matching your style, layout and how busy you want it; the top ~400 screenshots were looked at once (where each terminal is, what runs in it), so the agent judges cropped terminals, not whole desktops |
| Anchor | one image defines the look: yours, a chosen setup's, or generated (scenes, gradients, ASCII) |
| Style | palette from the anchor (16 ANSI colors + accent), contrast-checked; font, padding, prompt, effects |
| Fit | which tool does each part on your OS, and the closest alternative when one can't |
| Preview | an HTML mock terminal in the real colors, font and pane layout, for you to approve |
| Apply | configs staged, diff shown, you approve, then backup, write, verify each config, time shell startup |
| Polish | screenshot of the real terminal compared with the preview; small fixes |
| Undo | `tmt restore` puts every file back byte for byte |

## Safety

- Nothing is written until you approve the exact plan; the approval is tied to a hash
  of it, and apply refuses if a file changed since.
- Your own files keep your content: rc files get one marked block, JSON settings are
  merged key by key in their own style and encoding.
- Every file is backed up first. `tmt restore` undoes a whole run.
- Installs need your explicit yes (`--allow-installs` or the plugin option). System
  package managers that need `sudo` are printed for you to run.
- The plugin blocks the agent from editing live terminal configs directly, and won't let
  it stop with a change applied but unchecked.

Every terminal is built for its user from their request, their machine and real
references; nothing is copied from a preset.

## What's covered

Terminals: Windows Terminal, WezTerm, Ghostty, kitty, Alacritty, iTerm2, foot. Shells:
bash, zsh, fish, PowerShell, Nushell. Prompts and editing: starship, oh-my-posh,
PSReadLine, ble.sh, zsh-autosuggestions, zsh-syntax-highlighting, atuin. Multiplexers:
tmux, zellij. Plus CLI tools, Nerd Fonts and color scheme sources under
[`catalog/`](catalog). Each recipe records when and how it was verified (`machine` or
`docs`). Anything else the agent researches live and marks as unverified.

Tested on: Windows 11 on a real machine. macOS and Linux: the test suite runs there in
CI, and their recipes are checked against official docs, not yet on real machines.

## CLI

```
tmt new | status | runs | detect | capture | audit
tmt stage write|block|merge-json <target> <file> | install <mgr> <id> | install auto <tool> | font <name>
tmt plan | approve <hash> | apply [--allow-installs] | verify | measure [--before] | restore [run]
tmt art scene|treat|palette|scheme|contrast|ascii|preview ...
tmt inspire <words> [--os x] [--terminal x] [--layout kind] [--has clock,monitor] [--complexity 4+] [--limit n] [--save n dir [--crop]]
tmt shot | catalog list|show|cap|paths | look check <file>
```

`tmt help` for details. Add `--json` for machine-readable output.

## Develop

```
npm test           # node:test, never touches your real home (TMT_HOME)
npm run check      # catalog check + tests
node tools/privacy.js
claude plugin validate .
claude plugin eval . --tag trigger
```

See [`PLAN.md`](PLAN.md) for the design and [`AGENTS.md`](AGENTS.md) for conventions.

## License and data

[MIT](LICENSE). Images in this repo are generated by its own code. Tools it configures
keep their own licenses. Inspiration data: [awesome-dotfiles](https://github.com/0xN1nja/awesome-dotfiles)
(r/unixporn posts); screenshots are linked to their original posts, not copied.
`catalog/inspiration/annotations.json` stores only facts about them (boxes, layout, contents), no images.
