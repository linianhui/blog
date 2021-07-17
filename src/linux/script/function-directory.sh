declare -a __QUICK_ACCESS_DIRECTORY=()
__DELIMITER='.-_ ()'

function __directory_get_dir_name {
    path="$1:t"
    echo $path
}

function __directory_get_parent_dir_name {
    dir="$1"
    __directory_get_dir_name $(dirname "$dir")
}

function __directory_add_quick_access {
    dir="$1"
    delimiter=".-_ ()"
    if [ -f "$dir" ]; then
        echo "$dir is a file."
        return
    fi

    if [ -d "$dir" ]; then
        for subDir in $dir/*; do
            if [ -d "$subDir" ]; then
                subDirLowerCase=${subDir:l}
                name=$(__directory_get_dir_name $subDirLowerCase)
                parent=$(__directory_get_parent_dir_name $subDirLowerCase)
                nameAbbr=$(__string_abbr $name $__DELIMITER)
                parentAbbr=$(__string_abbr $parent $__DELIMITER)
                __QUICK_ACCESS_DIRECTORY+="$nameAbbr $parentAbbr$nameAbbr $subDirLowerCase $subDir"
            fi
        done
    else
        echo "$dir is not exist."
    fi
}


function __directory_list_quick_access {
    print -l $__QUICK_ACCESS_DIRECTORY
}

function __directory_search_quick_access {
    __directory_search_quick_access_core "$1" | sort -k1nr | while read line
    do
      echo ${line:2}
    done
}

function __directory_search_quick_access_core {
    search="$1"
    for line in $__QUICK_ACCESS_DIRECTORY; do
        result=$(__directory_search_quick_access_core_line $line $search)
        if [[ "$result" != "" ]]; then
            echo "$result"
        fi
    done
}

function __directory_search_quick_access_core_line {
    line="$1"
    search="$2"
    cols=($(echo $line))

    if [[ "$cols[1]" == *$search* ]]; then
        echo "9 $cols[4]"
        return
    fi

    if [[ "$cols[2]" == *$search* ]]; then
        echo "8 $cols[4]"
        return
    fi

    if [[ "$cols[3]" == *$search* ]]; then
        echo "7 $cols[4]"
        return
    fi
}

function __directory_to {
    dir="$1"
    echo "cd $dir"
    cd "$dir"
}