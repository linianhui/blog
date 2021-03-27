---
title: '[redis] replication'
created_at: 2021-03-20 09:29:23
tag: ["cache", "redis", "replication","ops"]
toc: true
---

绝大多数的情况下，redis中的数据都是读取远远多于写入。为了提供更高的读取QPS的支持，所以redis提供了`Replication`[^replication]的支持。
> ⚠️ 注意事项：
> 1. 单纯的Replication并不能处理redis意外宕机等导致的不可用问题。高可用`Sentinel`[^sentinel]来提供支持。
> 2. 单纯的Replication也不能提升redis的存储容量，比如master原本是提供8G的存储上限，那么搭配两个slave则依然是8G。扩容需要`Cluster`[^cluster]来提供支持。

# 1 搭建环境 {#install}

这里使用`docker-compose -f redis.yml up -d`启动一个主从复制的环境，一个`master`，两个`slave`。
{{<highlight-file path="redis.yml" lang="yml">}}

可以看出其非常简单，slave节点启动时指定`--slaveof master.test 6379`即可，其中`master.test`是master节点的地址（ip和domain name均可），`6379`是master节点的端口号。

```sh
# 查看启动后的redis主从复制的容器
docker-compose -f redis.yml ps

          Name                         Command               State            Ports         
--------------------------------------------------------------------------------------------
replication_master.test_1   docker-entrypoint.sh redis ...   Up      0.0.0.0:6379->6379/tcp 
replication_slave1.test_1   docker-entrypoint.sh redis ...   Up      0.0.0.0:16379->6379/tcp
replication_slave2.test_1   docker-entrypoint.sh redis ...   Up      0.0.0.0:26379->6379/tcp

# 进入master节点
docker exec -it replication_master.test_1 redis-cli
# 查看主从复制信息
127.0.0.1:6379> INFO replication
# Replication
role:master
connected_slaves:2
slave0:ip=172.19.0.4,port=6379,state=online,offset=28,lag=1
slave1:ip=172.19.0.3,port=6379,state=online,offset=28,lag=1
master_failover_state:no-failover
master_replid:42428ec1b6fc7c22438ec4c316db1a36ec6eec03
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:28
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:28
# 主节点执行SET
127.0.0.1:6379> SET name lnh

# 从节点获取数据
docker exec -it replication_slave2.test_1 redis-cli GET name
"lnh"

# 主节点查看一下主从复制信息
127.0.0.1:6379> INFO replication
# Replication
role:master
connected_slaves:2
slave0:ip=172.19.0.4,port=6379,state=online,offset=433,lag=0
slave1:ip=172.19.0.3,port=6379,state=online,offset=433,lag=1
master_failover_state:no-failover
master_replid:42428ec1b6fc7c22438ec4c316db1a36ec6eec03
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:433
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:433

# 从节点上查看一下主从信息
$ docker exec -it replication_slave2.test_1 redis-cli INFO replication
# Replication
role:slave
master_host:master.test
master_port:6379
master_link_status:up
master_last_io_seconds_ago:7
master_sync_in_progress:0
slave_repl_offset:643
slave_priority:100
slave_read_only:1
connected_slaves:0
master_failover_state:no-failover
master_replid:42428ec1b6fc7c22438ec4c316db1a36ec6eec03
master_replid2:0000000000000000000000000000000000000000
master_repl_offset:643
second_repl_offset:-1
repl_backlog_active:1
repl_backlog_size:1048576
repl_backlog_first_byte_offset:1
repl_backlog_histlen:643
```

# 2 运行原理 {#theory}

注意上面的信息中出现的`role`、`master_replid`和`master_repl_offset`。

。。。
# 3 详细配置 {#config}

{{<code-snippet lang="ini" href="https://github.com/redis/redis/blob/6.2/redis.conf#L446-L710">}}
# replicaof <masterip> <masterport>

{{</code-snippet>}}

。。。

# 4 参考 {#reference}

[^replication]:<https://redis.io/topics/replication>
[^sentinel]:<https://linianhui.github.io/redis/replication>
[^cluster]:<https://linianhui.github.io/redis/cluster>
