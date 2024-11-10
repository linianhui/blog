---
title: '[Windows] vlmcsd'
created_at: 2024-11-10 12:00:08
tag: ["Windows", "kms","vlmcsd"]
toc: true
---

# Windows

<https://github.com/Wind4/vlmcsd>

```sh
# 服务端 -s 注册为windows服务 -l 日志
vlmcsd-Windows-x64.exe -s -l c:\_vlmcsd\server.log

# 客户端-查看支持的版本
vlmcs-Windows-x64.exe -x

# 开放端口
netsh advfirewall firewall add rule name=vlmcsd1688 dir=in action=allow protocol=TCP localport=1688
```

# Docker
```sh
docker run -d -p 1688:1688 --restart=always --name vlmcsd ghcr.io/linianhui/vlmcsd:1113-2020-03-28
```

# Openwrt

```sh
vlmcsd-mips32el-openwrt-uclibc-static
```

{{<highlight-file path="vlmcsd.init" lang="sh">}}