# <https://linianhui.github.io> 

[![Github-Actions-Img]][Github-Actions-Url] 


# 本地运行

<http://localhost:1313>

1. hugo 运行
    ```bash
    hugo --config .hugo.yml server
    ```
2. Docker Compose 运行
    ```bash
    docker-compose up -d --build
    ```

# 依赖

| role                     | name                  | url                                                |
| ------------------------ | --------------------- | -------------------------------------------------- |
| Static website generator | hugo                  | <https://github.com/gohugoio/hugo>                 |
| Continuous deployment    | GitHub Actions        | <https://github.com/actions>                       |
| Hosted service           | GitHub Pages          | <https://pages.github.com/>                        |
| Hosted git repostory     | `linianhui.github.io` | <https://github.com/linianhui/linianhui.github.io> |
| Comments                 | utterance             | <https://github.com/utterance/utterances>          |

[Github-Actions-Img]:https://github.com/linianhui/blog/workflows/deploy/badge.svg
[Github-Actions-Url]:https://github.com/linianhui/blog/actions
