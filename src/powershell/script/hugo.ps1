function Hugo-Server() {
    Log-Debug "hugo --config hugo.yml --watch --buildDrafts --forceSyncStatic server"
    hugo --config hugo.yml --watch --buildDrafts --forceSyncStatic server
}