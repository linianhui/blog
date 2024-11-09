function Hugo-Server() {
    Log-Debug " hugo server --config hugo.yml --renderToMemory --watch --buildDrafts --forceSyncStatic --panicOnWarning --port 13131"
    hugo server --config hugo.yml --renderToMemory --watch --buildDrafts --forceSyncStatic --panicOnWarning --port 13131
}

function Hugo-Server-Blog() {
    cd d:/_code/blog
    Hugo-Server
}