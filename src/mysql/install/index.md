---
title: '[MySQL] install'
created_at: 2021-03-22 23:51:23
tag: ["db", "mysql", "install","ops","draft"]
toc: true
draft: true
---

# 1 二进制安装 {#binary}

下载[^mysql-download]最新版本的压缩文件，解压后即可。有相关的环境变量需要配置一下[^mysql-env]。

{{<highlight-file path="my.ini" lang="ini">}}

# 2 docker安装 {#docker}

<https://hub.docker.com/_/mysql>

# 3 本地运行 {#run}


```ps1
# windows 初始化 mysqld
mysqld --initialize --console
2021-05-18T15:07:33.683018Z 0 [System] [MY-013169] [Server] d:\_app\_mysql\bin\mysqld.exe (mysqld 8.0.25) initializing of server in progress as process 20320
2021-05-18T15:07:33.693510Z 1 [System] [MY-013576] [InnoDB] InnoDB initialization has started.
2021-05-18T15:07:34.398085Z 1 [System] [MY-013577] [InnoDB] InnoDB initialization has ended.
2021-05-18T15:07:36.578941Z 6 [Note] [MY-010454] [Server] A temporary password is generated for root@localhost: su/Da>mhS4-o

# 更改默认密码 su/Da>mhS4-o 为 1234
mysqladmin -u root -p password
```

## 3.1 运行服务端 {#run-server}

```ps1
# windows 启动 mysqld
mysqld --console
```

## 3.2 运行客户端 {#run-client}

```ps1
# 启动mysql
mysql -u root -p
```

# 4 参考 {#reference}

[^mysql-download]:<https://dev.mysql.com/downloads/mysql/>
[^mysql-env]:<https://dev.mysql.com/doc/refman/8.0/en/environment-variables.html>
