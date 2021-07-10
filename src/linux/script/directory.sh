declare -a __QUICK_ACCESS_DIRECTORY=()

function __directory_add_to_quick_access {
  dir="$1"
  if [ -f "$dir" ]; then
    echo "$dir is a file."
    return
  fi

  if [ -d "$dir" ]; then
    for subDir in $dir/*; do
      __QUICK_ACCESS_DIRECTORY+=$subDir;
    done
  else
    echo "$dir is not exist."
  fi
}

function __directory_get_path_list_from_quick_access {
    search=${1///*};
    echo $search
    print -l $__QUICK_ACCESS_DIRECTORY | while read line
    do
      if [[ $line == *$search* ]]; then
        echo $line;
      fi
    done
}

__directory_add_to_quick_access /lnh
__directory_add_to_quick_access /lnh/_code
__directory_add_to_quick_access /lnh/_github
__directory_add_to_quick_access /lnh/_app