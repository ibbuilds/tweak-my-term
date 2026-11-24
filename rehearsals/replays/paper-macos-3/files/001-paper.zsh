# paper prompt: one line, path and git branch
autoload -Uz add-zsh-hook
setopt PROMPT_SUBST
typeset -g _paper_git=''
_paper_precmd() {
  local b; b=$(git symbolic-ref --short -q HEAD 2>/dev/null) && _paper_git=" %F{#B5502F}$b%f" || _paper_git=''
}
add-zsh-hook precmd _paper_precmd
PROMPT='%F{#6B5F55}%~%f${_paper_git} %F{#B5502F}❯%f '
