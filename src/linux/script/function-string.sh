#!/bin/zsh

# example : __string_contains abc bc
function __string_contains {
    str="$1"
    subStr="$2"
    if [[ "$str" == *$subStr* ]]; then
        echo 0
        return
    fi
    echo 1
}

# example : __string_split 'abc-123.456_asd' '-_.'
function __string_split {
    str="$1"
    strLen=${#str}
    delimiter="$2"
    word=""
    i=0
    while [ $i -lt $strLen ]; do
        char=${str:$i:1}
        contains=$(__string_contains "$delimiter" "$char")
        if [[ "$contains" -eq "0" ]]; then
            if [ ! -z "$word" ]; then
                echo "$word"
            fi
            word=""
        else
            word="$word$char"
        fi
        i=$(( i + 1 ))
    done
    if [ ! -z "$word" ]; then
        echo "$word"
    fi
}

# example : __string_abbr abc-def '-'
function __string_abbr {
    name="$1"
    delimiter="$2"
    abbr=""
    __string_split "$name" "$delimiter" | while read line
    do
        abbr="$abbr${line:0:1}"
    done
    echo "$abbr"
}

function __string_test {
    actual=$(__string_contains abc bc)
    expect=0
    ok=$(__if_then_else $actual $expect $__TEST_OK_STRING $__TEST_FAIL_STRING)
    echo -e "test : __string_contains abc bc $ok"

    actual=$(__string_split abc-123.456_asd -_.)
    expect='abc\n123\n456\nasd'
    ok=$(__if_then_else $actual $expect $__TEST_OK_STRING $__TEST_FAIL_STRING)
    echo -e "test : __string_split abc-123.456_asd -_. $ok"

    actual=$(__string_abbr abc-def -)
    expect=ad
    ok=$(__if_then_else $actual $expect $__TEST_OK_STRING $__TEST_FAIL_STRING)
    echo -e "test : __string_abbr abc-def - $ok"
}

