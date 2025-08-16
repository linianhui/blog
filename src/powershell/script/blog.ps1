function Hugo-Server() {
    Log-Debug " hugo server --config hugo.yml --watch --buildDrafts --forceSyncStatic --panicOnWarning --port 13131"
    hugo server --config hugo.yml --watch --buildDrafts --forceSyncStatic --panicOnWarning --port 13131
}

function Blog() {
    cd d:/_code/blog
}

function Blog-Server() {
    Blog
    Hugo-Server
}