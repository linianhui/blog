---
title: '[Redis] replication'
created_at: 2021-03-20 09:29:23
tag: ["cache", "redis", "replication","ops"]
toc: true
displayed_on_home: true
---

绝大多数的情况下，redis中的数据都是读取远远多于写入。为了提供更高的读取QPS的支持，所以redis提供了`Replication`[^replication]的支持。
> 1. 单纯的Replication并不能处理redis意外宕机等导致的不可用问题。高可用需要`Sentinel`[^sentinel]来提供支持。
> 2. 单纯的Replication也不能提升redis的存储容量，比如master原本是提供8G的存储上限，那么搭配两个slave则依然是8G。扩容需要`Cluster`[^cluster]来提供支持。

# 1 搭建环境 {#install}

这里使用`docker-compose -f redis.yml up -d`启动一个主从复制的环境，一个`master`，两个`slave`。
{{<highlight-file path="redis.yml" lang="yml" hide="true">}}

可以看出其非常简单，slave节点启动时指定`--slaveof master.test 6379`即可，其中`master.test`是master节点的地址（ip和domain name均可），`6379`是master节点的端口号。

{{<highlight-file path="replication.6379" lang="sh" hide="true">}}

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

# 4 常见问题 {#faq}

1. <mark>slave脏读</mark>：因为master和slave之间的同步是异步的，master不会确保写入操作被所有slave都正确同步后才返回，故而如果在slave还未写完成时去读取，是会读取到脏数据的。这个无法避免，毕竟还有db托底。不过也可以通过在client这一侧用`INFO replication`去检查master和slave，对比其中的offset，如果diff结果差别超过了容忍范围，则移除client端对这个slave的访问，待恢复到合适的范围内后再添加回来，不过这种办法有些繁琐。
2. <mark>maxmemory配置不一致导致的数据丢失</mark>：比如master是4G，而slave是2G。但现在有3G数据需要同步给slave时，slave会因为内存不足而启动数据淘汰策略，从而被动丢失一部分数据。应该不设限slave的内存大小，至少大于master。
3. <mark>全量复制的庞大开销</mark>：当master的数据量比较大时，比如10G。那么增加一个slave，就会导致master需要发送10G左右的数据到slave，会严重消耗master节点的资源，也会使网络变得拥堵。应该选择业务低峰时间时增加slave。
4. <mark>master重启导致的数据丢失</mark>：master节点在意外重启后，如果没有rdb，则会导致清空slave的数据。不应关闭master的rdb。或者搭配sentinel提升slave为新的master。
5. <mark>缓冲区不足导致的循环全量复制</mark>：当master进行全量复制时，在生产rdb文件期间，会把所有的写命令保存在缓冲区中，如果缓冲区很小（默认1m）。那么即使slave已经完成了rdb的装载，但是offet不在缓冲区内，就会再次触发全量复制这么一个恶性循环。应估算复制耗时和写入量大小来调大缓冲区`rel_backlog_size`大小。


# 5 参考 {#reference}

[^replication]:<https://redis.io/topics/replication>
[^sentinel]:<https://linianhui.github.io/redis/sentinel>
[^cluster]:<https://linianhui.github.io/redis/cluster>
[^rdb]:<https://linianhui.github.io/redis/persistence/#rdb>

[^command-sync]:<https://redis.io/commands/sync>
[^command-psync]:<https://redis.io/commands/psync>
