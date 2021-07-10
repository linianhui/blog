declare -a __QUICK_ACCESS_DIRECTORY=()

function __directory_add_to_quick_access {
  Path="$1"
  if [ -f "$Path" ]; then
    echo "$Path is a file."
    return
  fi

  if [ -d "$Path" ]; then
    for file in $Path/*; do
      __QUICK_ACCESS_DIRECTORY+=$file;
    done
  else
    echo "$Path is not exist."
  fi
}

__directory_add_to_quick_access /lnh
__directory_add_to_quick_access /lnh/_code
__directory_add_to_quick_access /lnh/_github
__directory_add_to_quick_access /lnh/_app