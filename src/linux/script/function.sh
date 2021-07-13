#!/bin/zsh

__TEST_OK_STRING='\033[32mok\033[0m'
__TEST_FAIL_STRING='\033[31mfail\033[0m'

function __if_then_else {
    if [[ "$1" == "$2" ]]; then
        echo "$3"
    else
        echo "$4"
    fi
}

function __port(){
    lsof "-i:$1"
}