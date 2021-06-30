---
title: '[RabbitMQ] install'
created_at: 2021-04-09 14:00:12
tag: ["mq", "rabbitmq", "install","ops","draft"]
toc: true
draft: true
---

# 1 docker安装 {#docker}

<https://hub.docker.com/_/rabbitmq/>

```sh
docker run --name rabbitmq -d rabbitmq:3.8-management
```

{{<highlight-file path="Dockerfile" lang="Dockerfile">}}

# 2 参考 {#reference}

<https://www.rabbitmq.com/download.html>