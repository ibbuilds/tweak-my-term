#!/usr/bin/env bash
# Side pane: big pastel clock, no dependencies.
glyph() { # char -> 5 rows
  case $1 in
  0) echo "███|█ █|█ █|█ █|███";; 1) echo " █ |██ | █ | █ |███";; 2) echo "███|  █|███|█  |███";;
  3) echo "███|  █|███|  █|███";; 4) echo "█ █|█ █|███|  █|  █";; 5) echo "███|█  |███|  █|███";;
  6) echo "███|█  |███|█ █|███";; 7) echo "███|  █|  █|  █|  █";; 8) echo "███|█ █|███|█ █|███";;
  9) echo "███|█ █|███|  █|███";; :) echo "   | █ |   | █ |   ";;
  esac
}
printf '\e[?25l'; trap 'printf "\e[?25h"' EXIT
while :; do
  t=$(date +%H:%M:%S); rows=("" "" "" "" "")
  for ((i=0;i<${#t};i++)); do
    IFS='|' read -ra g <<< "$(glyph "${t:i:1}")"
    for r in 0 1 2 3 4; do rows[r]+="${g[r]}  "; done
  done
  printf '\e[H\e[2J\n'
  for r in 0 1 2 3 4; do printf '  \e[38;2;255;113;206m%s\e[0m\n' "${rows[r]}"; done
  printf '\n  \e[38;2;156;199;255m%s\e[0m\n' "$(date '+%A, %d %B %Y')"
  sleep 1
done
