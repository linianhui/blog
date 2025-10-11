# zsh              http://www.zsh.org/
# precmd           http://zsh.sourceforge.net/Doc/Release/Functions.html#Hook-Functions
# Prompt-Expansion http://zsh.sourceforge.net/Doc/Release/Prompt-Expansion.html#Prompt-Expansion
# __posh_git_echo  https://github.com/lyze/posh-git-sh

unsetopt PROMPT_SP
setopt prompt_subst
# RPROMPT="[%(?.%F{green}%?%f.%F{red}%?%f)]"

precmd(){
  USER_TYPE='%(!.#.$)'
  NEW_LINE=$'\n'
  LAST_EXIT_CODE="%(?..%F{red}%?%f)"
  TIME=$(gdate +'%y-%m-%d %T %:z %s%3N w%u d%-j')
  COMMON_PROMPT='$NEW_LINE%F{green}$USER_TYPE%f %d $TIME $LAST_EXIT_CODE'
  INPUT_PROMPT='$NEW_LINE'
  if git rev-parse --git-dir > /dev/null 2>&1; then
    GIT_USER="$(git config user.name)@<$(git config user.email)>"
    GIT_PROMPT='$NEW_LINE%F{green}$USER_TYPE $GIT_USER%f %F{red}%1d%f $(__posh_git_echo)'
    PROMPT="$COMMON_PROMPT $GIT_PROMPT $INPUT_PROMPT"
  else
    PROMPT="$COMMON_PROMPT $INPUT_PROMPT"
  fi
}