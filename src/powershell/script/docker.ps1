function Docker-Run() {
    Log-Debug "docker run --rm --tty --interactive" $Args
    docker run --rm --tty --interactive $Args
}
function Docker-Run-entrypoint() {
    Log-Debug "docker run --rm --tty --interactive --entrypoint" $Args
    docker run --rm --tty --interactive --entrypoint $Args
}

function Docker-Run-entrypoint-sh() {
    Log-Debug "docker run --rm --tty --interactive --entrypoint sh" $Args
    docker run --rm --tty --interactive --entrypoint sh $Args
}

function Docker-Run-entrypoint-bash() {
    Log-Debug "docker run --rm --tty --interactive --entrypoint bash" $Args
    docker run --rm --tty --interactive --entrypoint bash $Args
}