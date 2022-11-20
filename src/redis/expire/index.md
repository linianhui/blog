---
title: '[Redis] expire'
created_at: 2021-03-19 19:52:12
tag: ["cache", "redis", "expire","lru","lfu","ttl","dev"]
toc: true
displayed_on_home: true
---

因为redis通常主要用来作为一个缓存服务。缓存何时失效的问题号称是计算机科学领域两大难题之一（另一个是命名），这一篇文章就介绍下笔者对于缓存如何以及何时失效的问题理解。

# 1 过期删除方式 {#delete-way}

redis支持通过两种方式清理过期的key[^delete-way]：
1. 被动删除。
2. 主动删除。

## 1.1 被动删除 {#passive-delete}

在client访问(任意读写操作)一个key时，如果key设置了过期时间，则在访问时删除它们。如果没有主动设置过期时间，那么key则是会一直不会过期的。

## 1.2 主动删除 {#active-delete}

单单只有被动删除是完全不够的，当一个key完全不再会访问时，它就永远不会被删除了，这可不是我们希望看到的结果。
所以需要另外一个途径来清理这些以及失效的可以。这种途径就是定时删除（每秒10次）：
1. 随机对20设置了失效时间的key进行检测。
2. 删除所有已经过期的key。
3. 如果25%+的key已过期，则重复步奏1.

>为了提供一致性的无歧义行为。key失效或者DEL操作，也会写入到AOF中。RDB则不会包含已经过期或者被删除的数据。

# 2 内存管理 {#menmory-management}

有了以上的过期删除方式的支持，redis就可以帮我们删除失效的数据。但是现实中通常内存通常不是无限大的，所以就需要对内存进行管理[^lru]，以便在内存不足时提供可供选择的解决方案。在开始之前，我们先看一下redis是如何在内存中管理我们的数据库的吧。

{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/server.h#L702-L716">}}
typedef struct redisDb {
    dict *dict;                 /* The keyspace for this DB */
    dict *expires;              /* Timeout of keys with a timeout set */
    dict *blocking_keys;        /* Keys with clients waiting for data (BLPOP)*/
    dict *ready_keys;           /* Blocked keys that received a PUSH */
    dict *watched_keys;         /* WATCHED keys for MULTI/EXEC CAS */
    int id;                     /* Database ID */
    long long avg_ttl;          /* Average TTL, just for stats */
    unsigned long expires_cursor; /* Cursor of the active expire cycle. */
    list *defrag_later;         /* List of key names to attempt to defrag one by one, gradually. */
} redisDb;
{{</code-snippet>}}

上述的`redisDb`就是redis用来存储数据的一个顶层数据结构，可见其包含好几个字典字段，也就是存储我们的key/value的地方。其中这里我们需要关心的是前两个字段`dict`和`expires`字段，前者包含所有的key，后者是仅包含设置了失效时间的key（dict的子集）。

先解释两个术语（redis中实现的均是近似的算法）：
1. `LRU`：Least Recently Used。最近最少使用。
2. `LFU`：Least Frequently Used。最近不常使用。

那么比如按照以下的配置，redis最大使用内存上限为100mb。则在大小达到了100mb时，可供选择的方案也体现在以下配置的注释中。
{{<code-snippet lang="ini" href="https://github.com/redis/redis/blob/6.2/redis.conf#L945-L1056">}}
# 内存限制，0是无限制。
maxmemory 100mb

# noeviction       大部分的写入命令会返回错误，DEL除外。
# volatile-lru     在expires字段的范围内查找LRU的key，然后删除。
# allkeys-lru      在dict字段的范围内查找LRU的key，然后删除。
# volatile-random  在expires字段的范围内随机一些key，然后删除。
# allkeys-random   在dict字段的范围内随机一些key，然后删除。
# volatile-ttl     在expires字段的范围内查找失效的key，并且尝试删除TTL较短的key。
# volatile-lfu     在expires字段的范围内查找LFU的key，然后删除。
# allkeys-lfu      在dict字段的范围内查找LFU的key，然后删除。
# 如果没有键满足回收的前提条件的话，volatile-lru、volatile-random、volatile-ttl、volatile-lfu就和noeviction差不多了。
maxmemory-policy volatile-lfu

# 内存采样
maxmemory-samples 10
maxmemory-eviction-tenacity 10
replica-ignore-maxmemory yes
active-expire-effort 1

# lfu
lfu-log-factor 10
lfu-decay-time 1
{{</code-snippet>}}

## 2.1 工作原理 {#eviction-process}

在redis-server接收到写命令的时候，就会检查当前内存大小是否达到了配置中的限制大小。如果超过了则就会触发内存淘汰策略（LRU或LFU）的运行。

在redisServer对象中一个字段`lrulock`，代表一个全局的时钟，每隔一段时间就会更新这个字段。

key对象`redisObject`的`lru`字段(24位)，代表的是对象被创建时的时钟数据。
{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/server.h#L667-L675">}}
typedef struct redisObject {
    unsigned type:4;
    unsigned encoding:4;
    unsigned lru:LRU_BITS; /* LRU time (relative to global lru_clock) or
                            * LFU data (least significant 8 bits frequency
                            * and most significant 16 bits access time). */
    int refcount;
    void *ptr;
} robj;
{{</code-snippet>}}

那么通过对比这两个地方的时钟差值就是其存活的时间了。正规的LRU算法是维护一个队列，精确的删除最久远的那些数据，而redis并没维护这样一个队列，而是从`expires`字段或者`dict`字段中查找或者随机查找一些key，是一个近似于`LRU`算法的效果。因为其并不精确，比如以下：
```ini
k1---k1---k1---k1---k1
-----k2-----k2-------k2
```
明显是k1被频繁访问，但是由于创建时间早，则被优先删除了。而k2被访问频次越来越低，反而没有被删除。

为了解决上述问题，redis4.0+之后引入了`LFU`算法。还是上述的`lru`字段，把24位中的前16位还作为时钟，而后8位记录访问频次。有来访问次数记录，那么结果就更精确了。
>使用8位表示访问频次，只够容纳255，这肯定是远远不够的，故而redis采用了一个复杂的算法，并不是访问1次就直接+1，而是根据`lfu-log-factor`和`lfu-decay-time`俩参数来控制。如下表格：

| factor | 100 hits | 1000 hits | 100K hits | 1M hits | 10M hits |
| ------ | -------- | --------- | --------- | ------- | -------- |
| 0      | 104      | 255       | 255       | 255     | 255      |
| 1      | 18       | 49        | 255       | 255     | 255      |
| 10     | 10       | 18        | 142       | 255     | 255      |
| 100    | 8        | 11        | 49        | 143     | 255      |

# 3 命令 {#command}

1. `EXPIRE key seconds`[^command-expire]: O(1)。设置一个过期时间，单位秒。
2. `PEXPIRE key milliseconds`[^command-pexpire]: O(1)。设置一个过期时间，单位毫秒。
3. `EXPIREAT key timestamp`[^command-expireat]: O(1)。设置一个过期时间，Unix timestamp(距离1970-01-01T:00:00:00+00:00的秒数)。
4. `PEXPIREAT key milliseconds-timestamp`[^command-pexpireat]: O(1)。设置一个过期时间，Unix timestamp(距离1970-01-01T:00:00:00+00:00的豪秒数)。
5. `PERSIST key`[^command-persist]: O(1)。移除过期时间，使其永不过期。
6. `TTL key`[^command-ttl]: O(1)。返回有效的存活时间，单位秒。
7. `PTTL key`[^command-pttl]: O(1)。返回有效的存活时间，单位豪秒。

>不管是用`EXPIRE`和`EXPIREAT`，redis底层存储均是Unix timestamp。2.6+版本后，均是milliseconds版本的Unix timestamp。所以它是依赖OS的时钟的，比如设置了100s后过期，当OS时钟往后调整了200秒，那么这个key就会立即过期。再比如redis宕机了，过了90秒启动了，那么其有效期就只会剩下10秒了。
>`REANEME`操作会影响失效时间设置：当`newkey`不存在时，延续`oldkey`的设置；当`newkey`已经存在时，使用`newkey`的设置覆盖`oldkey`。

演示：
```sh
127.0.0.1:6379> SET e 123
OK
127.0.0.1:6379> TTL e
(integer) -1
127.0.0.1:6379> EXPIRE e 100
(integer) 1
127.0.0.1:6379> TTL e
(integer) 98
127.0.0.1:6379> TTL e
(integer) 97
```

## 3.1 滑动过期 {#sliding}

很经典的一种应用场景，用户session管理。比如当前需求是登陆后10分钟有效期，如果10分钟内没有任何访问，则自动失效。否则继续累加10分钟的有效期。

```sh
MULTI
GET session:123456789
EXPIRE session:123456789 600
EXEC
```

以上的效果就是每访问以此，就重置有效期为10分钟。

# 4 参考 {#reference}

[^lru]:<https://redis.io/topics/lru-cache>
[^delete-way]:<https://redis.io/commands/expire#how-redis-expires-keys>
[^command-expire]:<https://redis.io/commands/expire>
[^command-pexpire]:<https://redis.io/commands/pexpire>
[^command-expireat]:<https://redis.io/commands/expireat>
[^command-pexpireat]:<https://redis.io/commands/pexpireat>
[^command-ttl]:<https://redis.io/commands/ttl>
[^command-pttl]:<https://redis.io/commands/pttl>
[^command-persist]:<https://redis.io/commands/persist>