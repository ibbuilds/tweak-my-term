# vaporwave-night prompt: rounded pills, fork-free git branch. Sourced from ~/.bashrc.
__vw_git() {
  local d=$PWD h
  while [ -n "$d" ]; do
    if [ -e "$d/.git" ]; then
      if [ -f "$d/.git/HEAD" ]; then read -r h < "$d/.git/HEAD"; else h=; fi
      case $h in ref:*) printf '%s' "${h##*/}";; ?*) printf '%s' "${h:0:7}";; esac
      return
    fi
    d=${d%/*}
  done
}
__vw_prompt() {
  local rc=$?
  local R='\[\e[0m\]'
  local L=$'\ue0b6' Rr=$'\ue0b4'
  # pill: fg-of-edge = bg color; text dark on pastel bg
  local p_path='\[\e[38;2;123;167;224m\]' b_path='\[\e[48;2;123;167;224m\]'
  local p_git='\[\e[38;2;234;111;214m\]'  b_git='\[\e[48;2;234;111;214m\]'
  local p_ok='\[\e[38;2;126;181;127m\]'   b_ok='\[\e[48;2;126;181;127m\]'
  local p_er='\[\e[38;2;235;131;114m\]'   b_er='\[\e[48;2;235;131;114m\]'
  local dark='\[\e[38;2;23;18;41m\]' acc='\[\e[38;2;255;113;206m\]'
  local br; br=$(__vw_git)
  PS1="${p_path}${L}${b_path}${dark}\w${R}${p_path}${Rr}${R}"
  [ -n "$br" ] && PS1+=" ${p_git}${L}${b_git}${dark} ${br}${R}${p_git}${Rr}${R}"
  if ((rc)); then PS1+=" ${p_er}${L}${b_er}${dark}✗ ${rc}${R}${p_er}${Rr}${R}"
  else PS1+=" ${p_ok}${L}${b_ok}${dark}✓${R}${p_ok}${Rr}${R}"; fi
  PS1+=$'\n'"${acc}❯${R} "
}
PROMPT_COMMAND=__vw_prompt
