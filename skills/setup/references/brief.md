# Brief

Goal: one page (`brief.md` in the run folder) that the rest of the run is judged against.

## Facts come from `tmt detect`, not questions

OS and distro, terminals installed, current shell(s), prompt tool, fonts, package
managers, existing configs, PSReadLine version (Windows). Note what the user already
customised (`tmt capture` copies their configs into the run, read-only) so the new look
keeps their aliases, functions, keybindings and env.

## What to ask (max 3 questions, only if unknown and it changes the result)

1. **The look and the layout**: an image, a rice, a named theme, or words ("calm",
   "hacker", "warm paper"); and how they want things arranged (one window, splits, a
   dashboard). They are separate: a request can change one and keep the other. If they
   have nothing: offer Inspire.
2. **Where**: which terminal app and shell(s) they actually use daily. If they use
   several (e.g. Git Bash + PowerShell in Windows Terminal), the look covers all of them.
3. **Limits**: may we install things (terminal, fonts, prompt tool, CLI tools)? Is speed
   critical (default budget: shell ready in under 500 ms)?

Don't ask about things with a sensible default: font size (12-13), padding, cursor
style. Decide, then show in the preview.

How to ask:
- Read the request against [moods.md](moods.md) first: each mood lists the one or two
  choices it leaves open (e.g. vaporwave: dark night or bright pastel; CRT: amber or green).
  Those, plus the three above, are the only candidates.
- One message, all questions at once, each as 2-4 short options with your recommended
  default first, so "go with your picks" is a valid answer. Use the host's question tool
  (e.g. AskUserQuestion) when it has one; otherwise a numbered list.
- A mood with no anchor image: in the same message, show 3-6 differing inspiration picks
  (title, link, one line on what you'd take) and ask which is closest, or "none".
- After the answers, don't ask again until the preview: decide everything else.
- The user said "surprise me", "you choose" or "I trust you": ask nothing; pick, and say
  what you picked in the preview message.

## brief.md template

```markdown
# Brief: <run id>
Request (user's words): "..."
Style (look and feel): ...   (palette, mood, type, art, prompt)
Layout (arrangement): ...   (single window | panes: n, what runs where | tiling | dashboard | dropdown)
Anchor: <user image | rice #n | generate: description | none yet>
Examples taken: style from <links> | layout from <links>
Must have: ...            (e.g. image background, two-line prompt, git status, icons)
Must keep: ...            (aliases, keybindings, PSReadLine history, tools they use)
Terminal(s): ...  Shell(s): ...  OS: ...
Installs allowed: yes/no/ask   Budget: 500 ms
Out of scope: ...
```

## Reading requests

Mood and aesthetic words (vaporwave, lofi, paper, CRT, y2k, noir...): [moods.md](moods.md).


| User says | Means |
|---|---|
| "make it look like this" + image | the image is the anchor; match palette, mood and layout, not pixels |
| "like <rice link>" | its screenshot is the anchor, its dotfiles repo the reference configs |
| "splits / tmux / editor + logs" | a layout request: see [layout.md](layout.md) |
| "clean / minimal" | few colors, no background image, single-line prompt, generous padding |
| "hacker / matrix / retro" | mono green or amber, blocky or pixel font; CRT feel in the art or as a toggle, never at the cost of readable text |
| "cozy / warm" | warm low-contrast dark (gruvbox, everforest, rose-pine), soft accent |
| "cyberpunk / neon" | dark bg, saturated magenta/cyan accents, glow; generated scene `synthwave` |
| "fast" / "it's slow" | measure first; drop framework loaders, use compiled prompt, lazy-load |
| "fancy prompt" | starship / oh-my-posh (Windows PowerShell) with Nerd Font icons |
