# alias
alias ..='cd ..'
alias ...='cd ../..'

alias d='docker'
alias dc='docker-compose'
alias dm='docker-machine'
alias k8s='kubectl'
alias mk='minikube'

alias g='git'

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

alias hugo='hugo --config hugo.yml'

alias mvn-wrapper='mvn --non-recursive --debug io.takari:maven:wrapper -Dmaven=3.6.3'

alias gradle-wrapper='gradle wrapper --distribution-type all --gradle-version 6.7'

alias mvn-help='./mvnw help:describe -Ddetail'

alias java-x='java -X'
alias java-xx='java -XX:+UnlockDiagnosticVMOptions -XX:+UnlockExperimentalVMOptions -XX:+PrintFlagsFinal -version'

alias proxy='export ALL_PROXY=socks5://127.0.0.1:1080'
alias unproxy='unset ALL_PROXY'

alias redis-server='redis-server /lnh/_code/blog/src/redis/install/redis.conf'
