# 构建

| CI Service | Stauts                          |
| ---------- | ------------------------------- |
| AppVeyor   | [![AppVeyor-Img]][AppVeyor-Url] |

1. bash
    ```sh
    npm install -g hexo-cli --registry=https://registry.npm.taobao.org
    npm install --registry=https://registry.npm.taobao.org
    npm run pack
    ```
 1. docker
    ```sh
    docker-compose up -d
    ```


[AppVeyor-Img]:https://ci.appveyor.com/api/projects/status/elf7njee7eewnmco/branch/blog?svg=true
[AppVeyor-Url]:https://ci.appveyor.com/project/linianhui/linianhui-github-io/branch/blog