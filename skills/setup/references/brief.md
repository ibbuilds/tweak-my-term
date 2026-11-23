# Brief

Goal: one page (`brief.md` in the run folder) that the rest of the run is judged against.

## Facts come from `tmt detect`, not questions

OS and distro, terminals installed, current shell(s), prompt tool, fonts, package
managers, existing configs, PSReadLine version (Windows). Note what the user already
customised (`tmt capture` copies their configs into the run, read-only) so the new look
keeps their aliases, functions, keybindings and env.

## What to ask (max 3 questions, only if unknown and it changes the result)

1. **The look**: an image, a rice, a named theme, or words ("calm", "hacker", "warm
   paper"). If they have nothing: offer Inspire.
2. **Where**: which terminal app and shell(s) they actually use daily. If they use
   several (e.g. Git Bash + PowerShell in Windows Terminal), the look covers all of them.
3. **Limits**: may we install things (terminal, fonts, prompt tool, CLI tools)? Is speed
   critical (default budget: shell ready in under 500 ms)?

Don't ask about things with a sensible default: font size (12-13), padding, cursor
style. Decide, then show in the preview.

## brief.md template

```markdown
# Brief: <run id>
Request (user's words): "..."
Anchor: <user image | rice #n | generate: description | none yet>
Must have: ...            (e.g. image background, two-line prompt, git status, icons)
Must keep: ...            (aliases, keybindings, PSReadLine history, tools they use)
Terminal(s): ...  Shell(s): ...  OS: ...
Installs allowed: yes/no/ask   Budget: 500 ms
Out of scope: ...
```

## Reading requests

| User says | Means |
|---|---|
| "make it look like this" + image | the image is the anchor; match palette, mood and layout, not pixels |
| "like <rice link>" | its screenshot is the anchor, its dotfiles repo the reference configs |
| "clean / minimal" | few colors, no background image, single-line prompt, generous padding |
| "hacker / matrix / retro" | mono green or amber, CRT treatments (scanlines, glow), blocky font |
| "cozy / warm" | warm low-contrast dark (gruvbox, everforest, rose-pine), soft accent |
| "cyberpunk / neon" | dark bg, saturated magenta/cyan accents, glow; scene preset `synthwave` |
| "fast" / "it's slow" | measure first; drop framework loaders, use compiled prompt, lazy-load |
| "fancy prompt" | starship / oh-my-posh (Windows PowerShell) with Nerd Font icons |
