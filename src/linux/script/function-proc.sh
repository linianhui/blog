function __proc_env(){
    cat /proc/$1/environ | tr '\0' '\n' | sort
}

function __proc_env2(){
    ps ewww -o command $1 | tr ' ' '\n' | sort
}
