# neon-void prompt (bash). Pure builtins: no forks per prompt.
__nv_git() {
  local d=$PWD
  while [[ -n $d ]]; do
    if [[ -f $d/.git/HEAD ]]; then
      local h; read -r h < "$d/.git/HEAD"
      printf '%s' "${h#ref: refs/heads/}"; return
    fi
    d=${d%/*}
  done
}
__nv_prompt() {
  local rc=$?
  local c='\[\e[38;2;34;214;230m\]' m='\[\e[38;2;255;43;214m\]' r='\[\e[38;2;255;92;122m\]' x='\[\e[0m\]'
  local b; b=$(__nv_git)
  PS1="\n${c}\w${x}"
  [[ -n $b ]] && PS1+=" ${m}${b}${x}"
  ((rc)) && PS1+=" ${r}✘ ${rc}${x}"
  PS1+=$'\n'"${m}❯${x} "
}
PROMPT_COMMAND=__nv_prompt
