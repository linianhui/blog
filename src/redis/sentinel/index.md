---
title: '[redis] sentinel'
created_at: 2021-03-20 09:30:23
tag: ["cache", "redis", "sentinel","ops"]
toc: true
---

待完善。
`Sentinel`[^sentinel]。

# 1 搭建环境 {#install}

这里使用`docker-compose -f redis.yml up -d`启动一个主从复制的环境，一个`master`、两个`slave`和三个`sentinel`。
{{<highlight-file path="redis.yml" lang="yml" hide="true">}}

{{<highlight-file path="Dockerfile" lang="dockerfile" hide="true">}}

{{<highlight-file path="sentinel.conf" lang="ini" hide="true">}}

启动后进入到其中的一个sentinel中`docker exec -it sentinel_sentinel1.test_1 redis-cli -p 26379`:
{{<highlight-file title="SENTINEL master master1" path="sentinel.26379" lang="sh" hide="true">}}

# 2 运行原理 {#theory}
# 3 详细配置 {#config}

# 4 参考 {#reference}

[^sentinel]:<https://redis.io/topics/sentinel>