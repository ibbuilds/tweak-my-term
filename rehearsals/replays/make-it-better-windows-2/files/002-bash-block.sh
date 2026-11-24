# tweak-my-term: nord-calm prompt + greeting (interactive only)
case $- in *i*)
  eval "$(starship init bash)"
  [ -z "$TMT_GREETED" ] && export TMT_GREETED=1 && fastfetch --logo none -s Title:OS:Shell:Terminal:Uptime
;; esac
