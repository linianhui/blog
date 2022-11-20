---
title: '[Redis] persistence'
created_at: 2021-03-19 20:11:23
tag: ["cache", "redis", "persistence","rdb","aof","ops"]
toc: true
displayed_on_home: true
---

redis是基于内存存储数据的，当server意外宕机或者重启时，内存中的数据就会丢失掉。redis提供了如下几种选项来应对不同场景下的需求。
1. RDB(Redis DataBase) ：按照配置的时间周期来定时保存内存中的数据快照到disk上。
2. AOF (Append Only File) ：通过记录server接收到的每一个write命令，在下次启动时重放这些指令，以此达到恢复数据的目的。
3. No persistence ：完全禁用持久化。
4. RDB + AOF ：同时启用RDB和AOF。这种情况下AOF优先被使用。

# 1 RDB {#rdb}

`RDB`[^rdb-format]是一个非常紧凑的二进制格式的文件。它的工作方式是fork一个子进程，然后按照配置定时的把内存快照到disk上的一个单一的文件中。它的工作方式决定了它具备一下特点：
1. 备份文件方便传输。
2. 二进制数据恢复起来比较快。
3. 时间间隔使得可以按照时间节点来恢复指定的数据。但是同时也会丢失间隔内的数据。
4. fork出来的子进程可以隔离对主进程带来影响。但是当配置的时间间隔过小或者数据量较大时，会消耗过多的资源，从而挤压主进程的资源配额。

## 1.1 配置 {#rdb-config}

{{<code-snippet lang="ini" href="https://github.com/redis/redis/blob/6.2/redis.conf#L350-L445">}}
# save <seconds> <changes>
# 配置保存快照的时间间隔，以下配置是在300s内超过100次写操作就执行保存。
save 300 100

# 在background进程保存失败时禁用主进程的写操作（尽快提醒用户发现备份失败）
# 在background进程再次开启保存时会自动允许写操作。
stop-writes-on-bgsave-error yes

# 是否开启LZF压缩string对象，如果你想节省一些CPU资源，那么可以设置为no，但是可能会造成文件过大。
rdbcompression yes

# rdb文件CRC校验，10%的性能消耗。关闭以提升性能。
rdbchecksum no

# 删除没有持久化的复制实例中使用的RDB文件
rdb-del-sync-files no

# 保存的文件名
dbfilename dump.rdb

# 保存的目录，AOF也使用此目录
dir ./
{{</code-snippet>}}

## 1.2 命令 {#rdb-command}

1. `SAVE`[^command-save]：手动触发保存RDB，工作中主进程，会阻碍所有客户端的写操作请求。生产环境中千万不要使用。
2. `BGSAVE`[^command-bgsave]：手动触发保存RDB，工作中子进程（fork）。
 
# 2 AOF {#aof}

AOF(Append Only File)通过记录server接收到的每一个write命令，在下次启动时重放这些指令，以此达到恢复数据的目的。它具备一下特点：
1. 于RDB工作在子进程中不同，AOF是工作在主进程中的，也就意味着它可能会阻塞正常的业务调用。
2. 更小的保存时间间隔，比如1s。大大的减少丢失数据的可能性。
3. 更快的保存速度（相比RDB）。但是重建数据时不如RDB。
4. 可以针对保存的命令进行重写来减小文件大小。比如`SET name lnh`被调用来10次，其实保存最后一个命令即可。
5. 采用`RESP`[^resp]协议保存，具备可读性。可以便于人工修复意外受损的数据。

## 2.1 配置 {#aof-config}

{{<code-snippet lang="ini" href="https://github.com/redis/redis/blob/6.2/redis.conf#L1210-L1338">}}
# 开启AOF
appendonly yes

# 文件名
appendfilename "appendonly.aof"

# 配置何时调用fsync()，有如下3个选项：
# no        让OS决定，最快最不安全。
# always    每秒，最慢最安全。
# everysec  每次都调用，均衡的做法，也是官方推荐的默认配置
appendfsync everysec

# 开启自动AOF重写
# 当AOF文件的大小大于64mb时，才会触发AOF重写。
auto-aof-rewrite-min-size 64mb
# 当前AOF文件比上次重写后的增长的比例，超过此比例后触发下次重写。
auto-aof-rewrite-percentage 100

# 在redis自动启动一个子进程来进行AOF重写时，会涉及到频繁的disk fsync() I/O操作，这可能会造成主进程中的AOF操作被长时间阻塞。
# 那么此时，如果设置为yes，就相当于appendfsync=no的效果，交由OS来处理何时fsync()，从而避免阻塞主进程的append操作。但是如果期间出现意外宕机，在linux上则会丢失30s左后的数据操作。
# 如果设置为no，则是阻塞主进程的操作，但是保证数据的安全性。
no-appendfsync-on-rewrite yes

# 在载入AOF恢复数据时，忽略最后一条有可能出问题的指令（可能因为意外导致命令没有写入完整）。
# 如果完整则不会忽略的。可以使用redis-check-aof –fix来修复。
aof-load-truncated yes

# 同时开启RDB和AOF
# 开启后AOF文件前半段可能是RDB格式的全量数据，而后半段是AOF格式的增量数据。
aof-use-rdb-preamble yes
{{</code-snippet>}}

## 2.2 命令 {#aof-command}

1. `BGREWRITEAOF`[^command-bgrewriteaof]：手动触发AOF重写（也可以通过上面的配置让redis-server自动执行）。
2. `redis-check-aof –fix`：安装redis时带的一个程序，修复错误的AOF文件。

# 3 总结 {#sumamry}

RDB和AOF是redis提供的两种持久化数据的方式，都是对COW(copy-on-write)技术的巧妙使用。 
二者有不同的特点，可以按照不同的场景选择不同的方案或者同时使用它们。

# 4 参考 {#reference}

[^persistence]:<https://redis.io/topics/persistence>
[^rdb-format]:<https://github.com/sripathikrishnan/redis-rdb-tools/wiki/Redis-RDB-Dump-File-Format>
[^command-save]:<https://redis.io/commands/save>
[^command-bgsave]:<https://redis.io/commands/bgsave>
[^command-bgrewriteaof]:<https://redis.io/commands/bgrewriteaof>
[^resp]:<https://linianhui.github.io/redis/resp>