function Hugo-Server() {
    Log-Debug "hugo server --config hugo.yml --watch --buildDrafts --forceSyncStatic --panicOnWarning --disableFastRender"
    hugo --config hugo.yml --watch --buildDrafts --forceSyncStatic --panicOnWarning server
}