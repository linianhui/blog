---
title: '[redis] replication'
created_at: 2021-03-20 09:29:23
tag: ["cache", "redis", "replication","ops"]
toc: true
---

绝大多数的情况下，redis中的数据都是读取远远多于写入。`Replication`[^replication]

使用`docker-compose`启动一个主从复制，一个`master`，两个`slave`。

{{<highlight-file path="redis.yml" lang="yml">}}

# 参考 {#reference}

[^replication]:<https://redis.io/topics/replication>
