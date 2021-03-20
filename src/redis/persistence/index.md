---
title: '[redis] persistence'
created_at: 2021-03-19 19:50:23
tag: ["cache", "redis", "persistence","rdb","aof","ops"]
toc: true
---

redis是基于内存存储数据的，当server意外宕机或者重启时，内存中的数据就会丢失掉。redis提供了如下几种选项来应对不同场景下的需求。
1. RDB(Redis DataBase) ：按照配置的时间周期来定时保存内存中的数据快照到disk上。
2. AOF (Append Only File) ：通过记录server接收到的每一个write命令，在下次启动时重放这些指令，以此达到恢复数据的目的。
3. No persistence ：完全禁用持久化。
4. RDB + AOF ：同时启用RDB和AOF。这种情况下AOF优先被使用。

# 1 RDB {#rdb}

# 2 AOF {#aof}

# 3 总结 {#sumamry}

# 4 参考 {#reference}

[^persistence]:<https://redis.io/topics/persistence>
