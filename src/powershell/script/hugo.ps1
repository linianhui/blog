function Hugo-Server() {
    Log-Debug "hugo --config hugo.yml --watch --buildDrafts --forceSyncStatic --panicOnWarning server"
    hugo --config hugo.yml --watch --buildDrafts --forceSyncStatic --panicOnWarning server
}