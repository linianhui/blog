---
title: '[redis] replication'
created_at: 2021-03-20 09:29:23
tag: ["cache", "redis", "replication","ops"]
toc: true
---

绝大多数的情况下，redis中的数据都是读取远远多于写入。为了提供更高的读取QPS的支持，所以redis提供了`Replication`[^replication]的支持。
> ⚠️ 注意事项：
> 1. 单纯的Replication并不能处理redis意外宕机等导致的不可用问题。高可用需要`Sentinel`[^sentinel]来提供支持。
> 2. 单纯的Replication也不能提升redis的存储容量，比如master原本是提供8G的存储上限，那么搭配两个slave则依然是8G。扩容需要`Cluster`[^cluster]来提供支持。

# 1 搭建环境 {#install}

这里使用`docker-compose -f redis.yml up -d`启动一个主从复制的环境，一个`master`，两个`slave`。
{{<highlight-file path="redis.yml" lang="yml">}}

可以看出其非常简单，slave节点启动时指定`--slaveof master.test 6379`即可，其中`master.test`是master节点的地址（ip和domain name均可），`6379`是master节点的端口号。

```sh
# 查看启动后的redis主从复制的容器
docker-compose -f redis.yml ps

          Name                         Command               State    Ports  
-----------------------------------------------------------------------------
replication_master.test_1   docker-entrypoint.sh redis ...   Up      6379/tcp
replication_slave1.test_1   docker-entrypoint.sh redis ...   Up      6379/tcp
replication_slave2.test_1   docker-entrypoint.sh redis ...   Up      6379/tcp

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

# 主节点再查看一下主从复制信息
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

Replication支持的功能特性：
1. master可以有多个slave，slave之间也可以级链。比如master->slave1->slave2这种方式。
2. slave启动后自动连接master开始同步。
3. 同步过程是异步的，不会影响master的主线程。
4. 意外断开后会自动重连，然后再次同步。
5. 支持全量和增量同步。无法增量同步时，则会触发全量同步流程。

想要支持以上的功能特性，核心点在于master处理全量以及增量同步的实现机制。每个节点在启动时都有一个`master_replid`（一个伪随机的字符串，每次启动都会重新生成一个）和一个`master_repl_offset`（同步的数据的偏移量）信息，还有一个`master_replid2`来保存上次的`master_replid`。

当slave第一次连接到master事，会使用`PSYNC replicationid offset`[^command-psync]命令取请求master。

当master接收的id匹配时：**触发增量同步**。master发送offset之后的增量部分的数据（这部分数据位于内存缓存区中，无需读disk）给slave。

当master接收到id不匹配时：**触发全量同步**。master开启一个后台保存线程，用来产生一个`RDB`[^rdb]文件；同时开始缓冲所有从客户端接收到的新的写入命令。当后台保存完成时，master将rdb文件传输给slave，slave将之保存在磁盘上，然后加载文件到内存。再然后master会发送所有缓冲的命令发给slave。这个过程以指令流的形式完成并且和Redis协议本身的格式相同。

当slave意外重启后，slave记录的`master_replid`就会变成`master_replid2`，它自己会产生一个新的`master_replid`，这是它会用`master_replid2`和记录的offset去增量同步自身意外重启这段时间内丢失的数据。

> ⚠️ 注意事项：
> 当master关闭rdb并且开启来自动重启时。会有这么一种情况，master没有rdb，并且意外自动重启了。那么重启后slave也会被迫清空。

# 3 详细配置 {#config}

{{<code-snippet lang="ini" href="https://github.com/redis/redis/blob/6.2/redis.conf#L446-L710">}}
# master的地址和端口号
replicaof 192.168.2.2 6379
# master用户名
masteruser test
# master密码
masterauth 1234

# 配置为只读节点，2.6+后默认是只读的。
replica-read-only yes

# 当同步断开时，是否继续接收client的请求。
# yes 依然接收请求，但是因为同步断开了，所以数据可能是陈旧的。
# no  返回一个错误'SYNC with master in progress'给client。
replica-serve-stale-data yes

repl-diskless-sync no
repl-diskless-sync-delay 5
repl-diskless-load disabled
repl-ping-replica-period 10
repl-timeout 60
repl-disable-tcp-nodelay no
repl-backlog-size 1mb
repl-backlog-ttl 3600
replica-priority 100


min-replicas-to-write 3
min-replicas-max-lag 10

replica-announce-ip 5.5.5.5
replica-announce-port 1234

{{</code-snippet>}}

# 4 参考 {#reference}

[^replication]:<https://redis.io/topics/replication>
[^sentinel]:<https://linianhui.github.io/redis/sentinel>
[^cluster]:<https://linianhui.github.io/redis/cluster>
[^rdb]:<https://linianhui.github.io/redis/persistence/#rdb>

[^command-sync]:<https://redis.io/commands/sync>
[^command-psync]:<https://redis.io/commands/psync>
