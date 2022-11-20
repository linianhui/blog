---
title: '[Redis] benchmark'
created_at: 2021-03-19 20:12:23
tag: ["cache", "redis", "benchmark"]
toc: true
displayed_on_home: true
---

# 1 基本概念 {#concept}

redis速度非常快，但是有多块呢？首先我们需要分析一下当client发起对server的调用到获得结果这段时间内都经历了那些主要的步骤，比如如下代码：
```java
Jedis jedis = new Jedis("localhost");
String result = jedis.set("name", "lnh");
```
详细分解一下其中经历的主要步骤：
1. client发起调用；
    1. 初始化网络连接（或者从client端维护的连接池中获取连接）；
    2. 把java方法调用和数据对象序列化成`RESP`[^resp]协议格式；
    3. 写入网络I/O。
2. 网络传输；
    1. 把上一步的转换成resp协议后的数据通过网络发送给server。
3. server端处理调用；
    1. 接收请求数据，解析resp协议格式的数据；
    2. 执行解析后的command；如果开启AOF，则也会处理AOF的事情。
    3. 把执行结果序列化为resp协议格式。
4. 网络传输；
    1. 把上一步的转换成resp协议后的数据通过网络发送给client。
5. client接收响应；
    1. 读取网络IO数据，解析resp协议格式的数据。
    2. 反序列化为Java对象。 

总结来说主要是3大块：client、网络传输、server。那么从使用者的角度来看，重点需要关注的在于client端的序列化以及网络连接消耗。比如采用了不合适的数据结构，导致每次需要传输的数据量过大；以及连接池的过大或过小，或者根本没，从而增大每次建立底层TCP连接的消耗；再有就是server端的配置导致一些额外的操作（aof的appendfsync配置[^persistence]）、或者会导致长时间阻塞操作的命令导致的server端处理能力的下降。

> 有了对以上的基本概念的认知和理解后，就会发现有时候我们简单的写一个for循环重复取执行某一个操作的这种测试，其实是没有任何参考意义的，最终只是沦为对网络传输效率的测试。

# 2 测试工具 {#tool}

`redis-benchmark`[^benchmark]是redis提供的一个基准测试工具，可以模拟N个客户端同时发出M个请求。当然我们的基准性能测试并不能完全模拟出实际的业务调用，不过至少可以根据以上的基础概念，来组织出来近似的测试用例来检查我们所需的配置。

查看帮助`redis-benchmark --help`：
{{<highlight-file path="redis-benchmark.help" lang="sh">}}

从上述的帮助文档中可以看出它提供有如下几点功能：
1. `-c`：并行的client的数量。
2. `-n`：总的请求数量。
3. `-k`：是否使用长连接。
4. `-r`：value的数据块的大小。
5. `-d`：key的随机大小。
6. `-P`：pipline中的命令条数。
7. `-t`：特定的命令。


# 3 测试用例 {#test-case}

比如执行以下命令测试1000个随机key的`set`和`lpush`结果：
{{<highlight-file path="1.test" lang="sh">}}

piplining的测试对比，可以明显看出一次piplining中设置为10条命令时，性能翻了5倍！
```sh
$ redis-benchmark -t set,lpush -n 100000 -r 1000 -q 
SET: 47984.64 requests per second, p50=0.615 msec
LPUSH: 49875.31 requests per second, p50=0.615 msec

$ redis-benchmark -t set,lpush -n 100000 -r 1000 -q -P 10
SET: 248756.22 requests per second, p50=1.695 msec
LPUSH: 253164.55 requests per second, p50=1.639 msec
```

# 4 参考 {#reference}

[^resp]:<https://linianhui.github.io/redis/resp>
[^persistence]:<https://linianhui.github.io/redis/persistence>
[^benchmark]:<https://redis.io/topics/benchmarks>
