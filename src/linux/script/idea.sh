function __idea_open {
    dir="$@[$#]"
    echo "idea $dir"
    idea "$dir"
}