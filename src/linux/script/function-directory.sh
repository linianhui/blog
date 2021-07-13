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
    search="$1"
    array=()
    print -l $__QUICK_ACCESS_DIRECTORY | while read line
    do
        result=$(__directory_search_quick_access_line $line $search)
        if [[ "$result" != "" ]]; then
            array+="$result"
        fi
    done
    print -l $array
}

function __directory_search_quick_access_line {
    line="$1"
    search="$2"
    array=($(echo $line))

    contains=$(__string_contains $array[1] $search)
    if [[ "$contains" -eq "0" ]]; then
        echo "9$array[4]"
        return
    fi

    contains=$(__string_contains $array[2] $search)
    if [[ "$contains" -eq "0" ]]; then
        echo "8$array[4]"
        return
    fi

    contains=$(__string_contains $array[3] $search)
    if [[ "$contains" -eq "0" ]]; then
        echo "7$array[4]"
        return
    fi
}

function __directory_to {
    dir="$1"
    echo "cd $dir"
    cd "$dir"
}