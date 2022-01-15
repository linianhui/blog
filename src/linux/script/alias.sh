# alias
alias ..='cd ..'
alias ...='cd ../..'
alias d='__directory_to'
alias c='__vscode_open'
alias i='__idea_open'

alias dr='docker run --rm --tty --interactive'
alias dre='dr --entrypoint'
alias drs='dre sh'
alias drb='dre bash'
alias dh='docker history --human --no-trunc'
alias dc='docker-compose'
alias dm='docker-machine'
alias mk='minikube'

alias h='history | grep'

alias md='mkdir -p'

alias bak='backup_file'

alias cls='clear'

alias grep='grep --color=auto'

alias untar='tar -z -x -v -f'

alias wget='wget --continue --show-progress'

alias sha='shasum --algorithm 1'
alias sha256='shasum --algorithm 256'

alias ping='ping -c 5'

alias ipe='curl http://ifconfig.me/ip'
alias ipl='ipconfig getifaddr en0'

alias hs='miniserve --color-scheme squirrel --qrcode'
alias hsu='hs --upload-files'

alias pfd='rinetd --conf-file /lnh/_code/blog/src/tool/rinetd/rinetd.conf'
alias pf='pfd --foreground'

alias env='env | sort'

alias penv='proc_env'

alias penv2='proc_env2'

# https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html
alias path='echo "${PATH//:/\n}"'

# https://github.com/jeremyfa/yaml.js
# cnpm install -yamljs -g
alias yj='yaml2json --pretty --indentation 2'

alias jy='json2yaml --depth 64 --indentation 2'

alias shell='echo $SHELL'

alias shells='cat /etc/shells'

alias i18n='locale'

alias hu='hugo --config hugo.yml --buildDrafts --forceSyncStatic --panicOnWarning'

alias hus='hu --watch server'

alias mvn-wrapper='mvn --non-recursive --debug io.takari:maven:wrapper -Dmaven=3.8.1'

alias gradle-wrapper='gradle wrapper --distribution-type all --gradle-version 6.7'

alias mvn-help='./mvnw help:describe -Ddetail'

alias java-x='java -X'
alias java-xx='java -XX:+UnlockDiagnosticVMOptions -XX:+UnlockExperimentalVMOptions -XX:+PrintFlagsFinal -version'

alias proxy='export ALL_PROXY=socks5://127.0.0.1:1080'
alias unproxy='unset ALL_PROXY'

alias redis-server='redis-server /lnh/_code/blog/src/redis/install/redis.conf'

alias ja='java -jar $JAVA_HOME/arthas-boot.jar --repo-mirror aliyun --use-http'

alias master='git co master'
alias main='git co main'
alias g='git'
alias gti='git'
alias gi='git'
# java -cp $JAVA_HOME/lib/sa-jdi.jar sun.jvm.hotspot.HSDB

alias k='kubectl'
alias kp='k get pods'
alias kpt='kp -o custom-columns-file=/lnh/_code/blog/src/k8s/kubectl/terminated-pod.txt --sort-by="{.status.containerStatuses[0].lastState.terminated.finishedAt}"'