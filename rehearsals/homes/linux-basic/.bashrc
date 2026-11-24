# ~/.bashrc
[ -z "$PS1" ] && return
HISTSIZE=5000
alias ll='ls -alF'
alias gs='git status'
alias v='nvim'
PS1='\u@\h:\w\$ '
