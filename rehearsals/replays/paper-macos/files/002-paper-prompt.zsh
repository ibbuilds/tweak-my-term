# paper prompt: one line, path + git branch, terracotta marker
autoload -Uz vcs_info
precmd() { vcs_info }
setopt prompt_subst
zstyle ':vcs_info:git:*' formats ' %F{244}%b%f'
PROMPT='%F{240}%~%f${vcs_info_msg_0_} %F{166}❯%f '
