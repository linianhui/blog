function Hugo-Server() {
    Log-Debug "hugo --config hugo.yml --watch --buildDrafts server"
    hugo --config hugo.yml --watch --buildDrafts server
}