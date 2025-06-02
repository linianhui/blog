#!/bin/sh


function __byte_unit(){
    originNumber=$(echo $1 | sed 's/[^0-9]//g')
    originUnit=$(echo $1 | sed 's/[^a-z]//g')
    unitIndex=$(__byte_1024_index $originUnit)
    byte=$(__byte_multiply_1024 $originNumber $unitIndex)
    echo "${byte} byte"
    echo "$(__byte_divided_1024 $byte 1) kb"
    echo "$(__byte_divided_1024 $byte 2) mb"
    echo "$(__byte_divided_1024 $byte 3) gb"
    echo "$(__byte_divided_1024 $byte 4) tb"
    echo "$(__byte_divided_1024 $byte 5) pb"
}

function __byte_multiply_1024(){
    number=${1}
    count=${2}
    if [ "$count" == "0" ]
    then
        echo $number
    else
        byte1024=$((1024**$count))
        echo $(($number*byte1024))
    fi
}

function __byte_divided_1024(){
    number=${1}
    count=${2}
    if [ "$count" == "0" ]
    then
        echo $number
    else
        byte1024=$((1024**$count))
        echo "scale=2; $number / $byte1024" | bc
    fi
}

function __byte_1024_index(){
    fullUnit=${1,,}
    unit=${fullUnit:0:1}
    case $unit in
        "b")
            echo 0
        ;;
        "k")
            echo 1
        ;;
        "m")
            echo 2
        ;;
        "g")
            echo 3
        ;;
        "t")
            echo 4
        ;;
        "p")
            echo 5
        ;;
        *)
            echo "not support"
        ;;
    esac
}
