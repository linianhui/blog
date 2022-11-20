---
title: '[Redis] 运行时架构'
created_at: 2021-03-19 20:12:24
tag: ["cache", "redis", "thread","io-thread","benchmark","dev","runtime-architecture","architecture","thread-model"]
toc: true
displayed_on_home: true
---

redis自从诞生之处就被称之为单线程的方式实现的，这里的单线程指的是`socket read`、`解析`、`执行`和`socket write`这四个阶段都是由主线程独自完成的。当然一个redis-server实例并不是只有这一个线程，比如还有执行RDB、AOF、LRU、AOFREWRITE等等后台线程，只是它们的运行不会参与到server的主线程处理client的request这个流程中。

# 1 主线程 {#main}

```sh
# 启动一个redis的容器，开启AOF
docker run --name redis.test -d redis:6.2 redis-server --appendonly yes

# 进入容器查看
docker exec -it redis.test bash

# 安装包含top命令的工具包
root@4c3c02708a7a:/data# apt update && apt install procps

# 查看redis-server进程的信息
root@4c3c02708a7a:/data# top -H -n 1 -p 1

Threads:   5 total,   0 running,   5 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   4260.7 total,   2004.9 free,   1860.5 used,    395.3 buff/cache
MiB Swap:      0.0 total,      0.0 free,      0.0 used.   2180.8 avail Mem 

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      1 redis     20   0   52952   7048   5632 S   0.0   0.2   0:02.27 redis-server
     14 redis     20   0   52952   7048   5632 S   0.0   0.2   0:00.00 bio_close_file
     15 redis     20   0   52952   7048   5632 S   0.0   0.2   0:00.00 bio_aof_fsync
     16 redis     20   0   52952   7048   5632 S   0.0   0.2   0:00.00 bio_lazy_free
     17 redis     20   0   52952   7048   5632 S   0.0   0.2   0:00.00 jemalloc_bg_thd 
```
从上面的top结果可以看到除了主线程外，还有bio的三个线程和jemalloc_bg一个线程。

为什么redis选择使用一个主线程处理整个完整的request[^why-single-thread]？主要原因有一下几点： 
1. 性能瓶颈在于内存和网络I/O，而不是CPU。
2. 单线程实现更简单。
3. 多线程存在的线程切换，加锁导致性能下降。
4. 多线程带来的实现上的复杂度上升。
5. 多线程带来的线程不安全问题。

# 2 I/O线程 {#io}

得益于`I/O Multiplexing`(linux上主要是epoll)[^io-multiplexing]提供的高性能I/O，虽然redis-server是单线程，但是性能依然非常优秀。

但是`I/O Multiplexing`也并不是银弹，**其I/O的读写阶段依然是阻塞的**，这也是阻碍redis进一步提升性能主要的瓶颈点（`socket read`、`解析`、`执行`和`socket write`）。所以redis6.0引入了I/O多线程的支持，`socket read`、`解析`和`socket write`）三部分交由I/O线程取执行，然后主线程只负责执行阶段。

## 2.1 配置 {#config}

{{<code-snippet lang="ini" href="https://github.com/redis/redis/blob/6.2/redis.conf#L1120-1165">}}
# 开启
io-threads-do-reads yes
# io线程数
io-threads 4
{{</code-snippet>}}

# 3 参考 {#reference}

[^io-multiplexing]:<https://linianhui.github.io/computer-networking/io-model/#io-multiplexing>
[^why-single-thread]:<https://redis.io/topics/faq#redis-is-single-threaded-how-can-i-exploit-multiple-cpu--cores>
[^network-based-software-architecture]:[理解REST] 03 基于网络应用的架构：<https://linianhui.github.io/understand-rest/03-network-based-software-architecture/>