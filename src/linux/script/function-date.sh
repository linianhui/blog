#!/bin/sh

function __timestamp(){
    if [ "$2" == "i" ]
    then
        __iso8601_2_timestamp $1
    else
        __timestamp_2_iso8601 $1
    fi
}

function __timestamp_2_iso8601(){
    timestampSecond=${1:0:10}
    millisecond=$(printf ".%03d" ${1:10:3})
    date --date="@$timestampSecond" "+%FT%T${millisecond}Z%:z"
}

function __iso8601_2_timestamp(){
    dateTimeString=$(echo $1 | sed 's/[^0-9]//g')
    year=${dateTimeString:0:4}
    month=${dateTimeString:4:2}
    day=${dateTimeString:6:2}
    hour=${dateTimeString:8:2}
    minute=${dateTimeString:10:2}
    second=${dateTimeString:12:2}
    millisecond=${dateTimeString:14:3}
    timezone="+08:00"
    iso8601="${year}-${month}-${day}T${hour:-00}:${minute:-00}:${second:-00}Z${timezone}"
    date --date "${iso8601}" "+%s${millisecond:-000}"
}