# gruvbox-cozy (tmt): interactive-only
status is-interactive; or return

set -g fish_greeting
set -g fish_color_normal ebdbb2
set -g fish_color_command b8bb26 --bold
set -g fish_color_keyword fb4934
set -g fish_color_param ebdbb2
set -g fish_color_option 83a598
set -g fish_color_quote fabd2f
set -g fish_color_redirection d3869b
set -g fish_color_end fe8019
set -g fish_color_operator 8ec07c
set -g fish_color_escape 8ec07c
set -g fish_color_error fb4934 --underline
set -g fish_color_comment 928374
set -g fish_color_autosuggestion 7c6f64
set -g fish_color_valid_path --underline
set -g fish_color_cwd fabd2f
set -g fish_color_selection --background=504945
set -g fish_color_search_match --background=504945
set -g fish_pager_color_prefix fe8019 --bold
set -g fish_pager_color_completion ebdbb2
set -g fish_pager_color_description 928374
set -g fish_pager_color_progress 928374
set -g fish_pager_color_selected_background --background=504945

set -gx EDITOR hx
set -gx BAT_THEME gruvbox-dark
set -gx FZF_DEFAULT_OPTS "--color=bg+:#504945,bg:#282828,spinner:#fe8019,hl:#fb4934,fg:#ebdbb2,header:#928374,info:#fabd2f,pointer:#fe8019,marker:#b8bb26,fg+:#ebdbb2,prompt:#fabd2f,hl+:#fb4934 --border=rounded"

if command -q eza
    alias ls 'eza --icons --group-directories-first'
    alias ll 'eza -l --icons --group-directories-first --git'
end
if command -q bat
    alias cat 'bat --paging=never'
end
if command -q zoxide
    zoxide init fish | source
end

function y
    set -l tmp (mktemp -t yazi-cwd.XXXXXX)
    yazi $argv --cwd-file=$tmp
    if read -z cwd <$tmp; and test -n "$cwd"; and test "$cwd" != "$PWD"
        builtin cd -- $cwd
    end
    rm -f -- $tmp
end

if command -q starship
    starship init fish | source
end
