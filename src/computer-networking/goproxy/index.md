---
title: "[计算机网络] GoProxy"
created_at: 2020-05-28 13:12:00
tag: ["proxy","go","port forwarding"]
toc: true
---

# 1 概述 {#overview}

[goproxy](https://github.com/snail007/goproxy)是一个基于Go语言编写的开源的云原生的边界路由器。

下载: <https://github.com/snail007/goproxy/releases>

使用示例:
```bash
# 配置(转发本地的2375和9000端口到182.168.2.201的对应端口)
proxy @config.txt
```

{{<highlight-file file="config.txt" lang="bash">}}

# 2 参考 {#reference}

<https://snail007.github.io/goproxy/>
