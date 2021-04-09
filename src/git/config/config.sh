set -eux

# checkout
git config --global alias.co checkout

# commit
git config --global alias.ci commit
git config --global alias.alc 'commit --amend --no-edit'

# status
git config --global alias.st 'status --short --branch'

# branch
git config --global alias.br branch

# pull
git config --global alias.pr 'pull --rebase'

# merge
git config --global alias.mnf 'merge --no-ff'

# diff
git config --global alias.d diff
git config --global alias.dt difftool

# cherry-pick
git config --global alias.cp cherry-pick

# log
git config --global alias.last 'log -1'
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# count-objects
git config --global alias.size 'count-objects -v -H'

# reflog
git config --global alias.rl "reflog --format='%cd %h %gs' --date=format:'%Y-%m-%d %H:%M:%S'"

# gc
git config --global alias.warn-expire-reflog "reflog expire --expire=now --all"
git config --global alias.warn-gc-now "gc --prune=now --aggressive"

# chmod +/- x
git config --global alias.chmod644 "update-index --chmod=-x"
git config --global alias.chmod755 "update-index --chmod=+x"

# head
git config --global alias.head 'symbolic-ref HEAD'

# default branch
git config --global init.defaultBranch main

# gui
git config --global gui.encoding 'utf-8'

# i18n
git config --global i18n.commitencoding 'utf-8'
git config --global core.quotepath false

# editor
git config --global core.editor "code -w"
git config --global core.autocrlf false
git config --global core.safecrlf true
git config --global core.filemode false

# color
git config --global color.ui true

# branch pager
git config --global pager.branch false

# https://github.com/microsoft/Git-Credential-Manager-Core
git config --global credential.helper manager-core