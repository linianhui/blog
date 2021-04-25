function Hugo-Server() {
    Log-Debug "hugo --config hugo.yml --watch server"
    hugo --config hugo.yml --watch server
}