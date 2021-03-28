---
title: '[redis] sentinel'
created_at: 2021-03-20 09:30:23
tag: ["cache", "redis", "replication", "high availability","sentinel","ops"]
toc: true
---

在上一篇博客`Replication`[^replication]中我们构建了一个简单的主从复制架构的redis服务，利用Replication我们可以让redis提供读写分离、提供读取能力、数据备份等功能，也支持slave从鼓掌中恢复。但是如果master出现了故障，那么整Replication都会处于一个不可用的状态。这显然无法满足高可用的目标。而整个目标需要借助`sentinel`[^sentinel]来实现。 

sentinel概述：
1. **监控**：sentinel是一个分布式系统，多个实例利用`gossip`协议协同工作。sentinel监控master和slave实例，同时sentinel实例之间也互相监控。
2. **通知**： 当某一个实例出现问题时，sentinel可以通过API通知系统管理员。
3. **自动故障转移**：如果被监控的master出现问题，sentinel可以启动一个自动故障转移的过程，sentinel实例之间选举出来一个slave提升为master，然后配置其他slave的配置使其成为新的master的slave，并且通知client使用新的连接地址。
4. **配置提供者**：client不再之间连接到master或者slave，而是连接到sentinel，由sentinel提供redis的master和slave的地址。

# 1 搭建环境 {#install}

运行sentinel有两种方式：
1. `redis-sentinel /path/to/sentinel.conf`;
2. `redis-server /path/to/sentinel.conf --sentinel`;

两种方式完全一样的（通常`redis-sentinel`文件是`redis-server`的一个符号连接，redis-server启动时会做如下检查）：
{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/server.c#L5826-L5835">}}
/* Returns 1 if there is --sentinel among the arguments or if
 * argv[0] contains "redis-sentinel". */
int checkForSentinelMode(int argc, char **argv) {
    int j;
    if (strstr(argv[0],"redis-sentinel") != NULL) return 1;
    for (j = 1; j < argc; j++)
        if (!strcmp(argv[j],"--sentinel")) return 1;
    return 0;
}
{{</code-snippet>}}

与`redis-server`默认的`6379`端口号不同的是，`redis-sentinel`默认运行在`26379`端口。

这里使用`docker-compose -f redis.yml up -d`启动一个主从复制的环境，一个`master`、两个`slave`和三个`sentinel`。
{{<highlight-file path="redis.yml" lang="yml" hide="true">}}

{{<highlight-file path="Dockerfile" lang="dockerfile" hide="true">}}

{{<highlight-file path="sentinel.conf" lang="ini" hide="true">}}

启动后进入到其中的一个sentinel中`docker exec -it sentinel_sentinel1.test_1 redis-cli -p 26379`:
{{<highlight-file title="sentinel master master1" path="sentinel.26379" lang="sh" hide="true">}}

# 2 运行原理 {#theory}
# 3 详细配置 {#config}

{{<code-snippet lang="ini" href="https://github.com/redis/redis/blob/6.2/sentinel.conf">}}
# 配置监控的master、ip、port和ODOWN的人数，并起一个名字
# sentinel monitor <master-name> <ip> <redis-port> <quorum>
sentinel monitor master1 master.test 6379 2
# master密码
# sentinel auth-pass <master-name> <password>

# 判定SDOWN的时间间隔
# sentinel down-after-milliseconds <master-name> <milliseconds>
sentinel down-after-milliseconds master1 30000
# sentinel failover-timeout <master-name> <milliseconds>
sentinel failover-timeout master1 180000
# sentinel parallel-syncs <master-name> <numreplicas>
sentinel parallel-syncs master1 1

protected-mode no

# 端口号
port 26379

# 以daemon方式运行时会写入一个/var/run/redis-sentinel.pid文件 
daemonize no
# 自定义pid文件路径
pidfile /var/run/redis-sentinel.pid

# 日志文件地址，默认/dev/null
logfile ""

# NAT网络环境中配置的IP和Port
sentinel announce-ip 1.2.3.4
sentinel announce-port 26379

# 其中主机名代替IP
SENTINEL resolve-hostnames yes
SENTINEL announce-hostnames no
{{</code-snippet>}}

# 4 参考 {#reference}

[^sentinel]:<https://redis.io/topics/sentinel>
[^replication]:<https://linianhui.github.io/redis/replication>