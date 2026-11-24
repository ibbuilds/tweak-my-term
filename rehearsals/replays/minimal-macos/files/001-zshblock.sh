# calm-moon prompt: path, git branch, one accent character
autoload -Uz vcs_info add-zsh-hook
zstyle ':vcs_info:git:*' formats ' %F{#6e6a86}%b%f'
add-zsh-hook precmd vcs_info
setopt prompt_subst
PROMPT='%F{#9ccfd8}%~%f${vcs_info_msg_0_} %(?.%F{#c4a7e7}.%F{#eb6f92})❯%f '
