function __git_warn_gc () {
    echo -e "\033[32mgit reflog expire --expire=now --all \033[0m"
    git warn-expire-reflog
    echo -e "\033[32mgit gc --prune=now --aggressive \033[0m"
    git warn-gc-now
    echo -e "\033[32mgit count-objects -v -H \033[0m"
    git size
}

function __git_proxy(){
    local action=${1:-get}

    if [ $action = 'set' ] ;then
        git config --global http.proxy 'socks5://127.0.0.1:1080'
    fi

    if [ $action = 'unset' ] ;then
        git config --global --unset http.proxy
    fi

    git config --global --get http.proxy
}
