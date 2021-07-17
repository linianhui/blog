#!/bin/zsh

# example : __string_contains abc bc
function __string_contains {
    if [[ "$1" == *$2* ]]; then
        echo 0
        return
    fi
    echo 1
}

# example : __string_match abc ac
function __string_match {
    str="$1"
    subStr="$2"
    subStrLen=${#subStr}
    for i ({1..$subStrLen}) {
        char=$subStr[$i]
        strLen=${#str}
        strIndex=1
        strIndex=$str[(i)$char]
        if (( $strIndex > $strLen )) then
            echo 1
            return
        else
            str=${str:$strIndex}
        fi
    }
    echo 0
}

# example : __string_split 'abc-123.456_asd' '-_.'
function __string_split {
    echo ${1//[$2]/ }
}

# example : __string_abbr abc-def '-'
function __string_abbr {
    abbr=""
    for word in $(echo ${1//[$2]/ }); do
        abbr="$abbr${word:0:1}"
    done
    echo "$abbr"
}

function __string_test {
    actual=$(__string_contains abc bc)
    expect=0
    ok=$(__if_then_else $actual $expect $__TEST_OK_STRING $__TEST_FAIL_STRING)
    echo -e "test : __string_contains abc bc $ok"

    actual=$(__string_match abc ac)
    expect=0
    ok=$(__if_then_else $actual $expect $__TEST_OK_STRING $__TEST_FAIL_STRING)
    echo -e "test : __string_match abc ac $ok"

    actual=$(__string_split abc-123.456_asd -_.)
    expect='abc 123 456 asd'
    ok=$(__if_then_else $actual $expect $__TEST_OK_STRING $__TEST_FAIL_STRING)
    echo -e "test : __string_split abc-123.456_asd -_. $ok"

    actual=$(__string_abbr abc-def -)
    expect=ad
    ok=$(__if_then_else $actual $expect $__TEST_OK_STRING $__TEST_FAIL_STRING)
    echo -e "test : __string_abbr abc-def - $ok"
}

