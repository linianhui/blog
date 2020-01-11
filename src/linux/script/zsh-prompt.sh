# zsh              http://www.zsh.org/
# precmd           http://zsh.sourceforge.net/Doc/Release/Functions.html#Hook-Functions
# __posh_git_echo  https://github.com/lyze/posh-git-sh
precmd(){
  USER_TYPE='%(!.#.$)'
  NEW_LINE=$'\n'
  COMMON_PROMPT='$NEW_LINE%{$fg[green]%}$USER_TYPE %n@%M%{$reset_color%} %d %T'
  INPUT_PROMPT='$NEW_LINE%{$fg[green]%}$USER_TYPE %{$reset_color%}'
  if git rev-parse --git-dir > /dev/null 2>&1; then
    GIT_USER="$(git config user.name)@<$(git config user.email)>"
    GIT_PROMPT='$NEW_LINE%{$fg[green]%}$USER_TYPE $GIT_USER%{$reset_color%} %{$fg[red]%}%1d%{$reset_color%} $(__posh_git_echo)'
    PS1="$COMMON_PROMPT $GIT_PROMPT $INPUT_PROMPT"
  else
    PS1="$COMMON_PROMPT $INPUT_PROMPT"
  fi
}