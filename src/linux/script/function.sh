function backup_file() {
    cp "$1" "$1.bak";
}

function port(){
    lsof "-i:$1"
}

function git_warn_gc () {
    echo -e "\033[32mgit reflog expire --expire=now --all \033[0m"
    git warn-expire-reflog
    echo -e "\033[32mgit gc --prune=now --aggressive \033[0m"
    git warn-gc-now
    echo -e "\033[32mgit count-objects -v -H \033[0m"
    git size
}

function proc_env(){
    cat /proc/$1/environ | tr '\0' '\n' | sort
}

function proc_env2(){
    ps ewww -o command $1 | tr ' ' '\n' | sort
}

function git_proxy(){
    local action=${1:-get}

    if [ $action = 'set' ] ;then
        git config --global http.proxy 'socks5://127.0.0.1:1080'
        git config --global https.proxy 'socks5://127.0.0.1:1080'
    fi

    if [ $action = 'unset' ] ;then
        git config --global --unset http.proxy
        git config --global --unset https.proxy
    fi

    git config --global --get http.proxy
    git config --global --get https.proxy
}
