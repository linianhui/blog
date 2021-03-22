---
title: '[redis] pipelining'
created_at: 2021-03-20 09:35:23
tag: ["cache", "redis", "pipelining","rtt","dev"]
toc: true
---

# 1 问题分析 {#issue}
设想一下有这样一个场景。在一个`RTT`[^rtt]为10ms的网络环境下，循环执行一个`INCR xxkey`的操作，假定redis-server每次耗时1ms。

当cleint发出`INCR xxkey`的命令后，要等11ms后才能收到响应。如果循环100次，则总共就需要`1100ms`。显然redis-server执行100次仅需要`1ms*100=100ms`，而消耗在`RTT`[^rtt]上所需的时间为`10ms*100=1000ms`。网络延迟消耗了太多的时间。

>redis的基本通信模型是request/response。即client1发送一个request1，然后等待server处理完后的response1。在这个期间，server也是处于阻塞状态的，也就是说这时你又来另外一个client2的request2，那么这个request2也需要等待server1处理完response1后才能继续处理。

# 2 解决方案 {#solution}

那么有没有办法改善上述的网络性能问题呢？当然是有的，有2种途径：
1. 应用层面：提升redis-server处理性能，不过目前已经是1ms了，即使优化成0.1ms，那么最终变成了10.01ms，改善也不明显。
2. 网络层面：因为网络延迟占据了11ms中的10ms，占比最大，所以优化它的效果是最好的。这里也有2种途径：
    1. 优化网络，降低网络延迟。比如把10ms优化到6ms。
    2. 在一次request中塞进去多条命令。比如把100条命令按照顺序放在一个request中发给server，server则按照顺序在一个response中包含100个处理结果。

如何优化网络这里我们不关注，这里重点关注的是redis提供的`pipelining`[^piplining]功能（在一次request中塞进去多条命令）。在网络延迟和server处理能力不变的前提下，我们一次性发送100个命令，这时的时间总和就是`1ms*100+100ms=200ms`，从而大大的改善了client网络性能和效率。
> 和HTTP/1.1中的pipliing是类似的技术。

`pipelining`[^piplining]功能需要redis-server端的支持，但是无序单独的命令来开启，client一次性把多个命令一块发出去就是了。常用到的client库通常都直接支持，比如`Jedis`[^jedis]：
```java
Pipeline pipline = jedis.pipelined();
for (int i = 0; i < 100; i++) {
    pipline.get(i + "");
}
List<Object> resultList = pipline.syncAndReturnAll();
```

需要注意的是这些指令直接应该是没有依赖关系的，比如后一条指令依赖前一条指令的结果这种肯定是不行的，这时就需要用到`Lua Script`[^lua-script]了。此外也不是原子性的，它仅仅只是一个批量操作（当然每个命令本身还是原子性的）。

# 3 参考 {#reference}

[^piplining]:<https://redis.io/topics/pipelining>
[^rtt]:<https://linianhui.github.io/computer-networking/00-overview/#round-trip-time>
[^lua-script]:<https://linianhui.github.io/redis/lua>