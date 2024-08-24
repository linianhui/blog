#!/bin/sh

function __timestamp_2_iso8601(){
  timestampSecond=${1:0:10}
  millisecond=$(printf ".%03d" ${1:10:3})
  date "+%FT%T${millisecond}Z%:z" --date="@$timestampSecond"
}