function Docker-Run() {
    Console-Debug "docker run --rm --tty --interactive" $Args
    docker run --rm --tty --interactive $Args
}
function Docker-Run-Entrypoint() {
    Console-Debug "docker run --rm --tty --interactive --entrypoint" $Args
    docker run --rm --tty --interactive --entrypoint $Args
}

function Docker-Run-Entrypoint-Sh() {
    Console-Debug "docker run --rm --tty --interactive --entrypoint sh" $Args
    docker run --rm --tty --interactive --entrypoint sh $Args
}

function Docker-Run-Entrypoint-Bash() {
    Console-Debug "docker run --rm --tty --interactive --entrypoint bash" $Args
    docker run --rm --tty --interactive --entrypoint bash $Args
}