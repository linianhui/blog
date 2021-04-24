---
title: '[计算机网络编程] 运行时架构'
created_at: 2021-04-23 13:46:23
tag: ["io","networking","runtime-architecture","architecture","thread-model"]
toc: true
---

基于`IO模型`[^io-model]、`Socket API`[^socket]以及`IO Multiplexing API`[^io-multiplexing]，基本上已经涵盖了目前基于网络编程的所使用的主流技术点。那么我们就可以评估一下各种组合方式所带来的 **架构属性**[^architectural-properties-of-key-interest]。

通常来讲基于网络的应用都会匹配最基础的`C/S风格`[^client-server]。这样的应用至少有两个核心组件：client和server，我们这里就关注一下这两个组件内部在运行时抽象的架构。其次网络通信的传输协议主要有UDP和TCP两个，而UDP因为其无需建立连接，所以其对于client和server而言均是无状态的，这时并不需要进行复杂的抽象处理，也就没有必要对其进行评估。这里只关注TCP的情况，其实从这里也可以看出来我们所做的运行时抽象，主要就是在如何管理TCP的连接上。

# 1 客户端 {#client}

## 1.1 短连接+同步IO {#nonpersistent-connection-and-sync-io}

最为基本的组合，每次通信就建立一个新的连接，然后采用同步IO`send`和`recv`的方式和服务器进行交互。

1. 简单性(+)：上层当作无状态的通信方式来使用了，故而实现起来非常简单。
2. 网络性能(-)：由于底层需要在通信前建立连接，这个阶段会浪费额外的网络性能。
3. 网络效率(-)：同上，浪费一些带宽在建立连接上，使得网络效率下降。

比如HTTP/1.0默认是采用短连接的。

## 1.2 长连接+同步IO {#persistent-connection-and-sync-io}

在**短连接+同步**IO的基础上，复用底层的连接。

1. 简单性(-)：稍微复杂一些，需要维护保持一下连接。
2. 网络性能(+)：省去了每次建立连接的步骤。
3. 网络效率(+)：同上。
4. 用户感知的性能(+)：同上。

比如HTTP/1.1把默认改为了长连接。

## 1.3 长连接+同步IO+连接池 {#persistent-connection-and-sync-io-and-connection-pool}

在**长连接+同步IO**的基础上，专门维护更多的长连接。

1. 简单性(--)：更复杂一些，需要维护专门的连接以及任务队列。
2. 网络性能(±)：维持的连接数以及任务队列的选择有时候反而会降低网络性能。比如浪费太多的时间在从池中获取连接上。
3. 网络效率(+)：维持多个连接的成本主要是在通信双方，网络链路中并没有多少额外的成本，故而网络效率会得到提升。
4. 用户感知的性能(+)：得益于客户端可以同时处理多个连接。

比如一个小的db连接池反而有助于提升网络性能[^pool-sizing]。

## 1.4 长连接+异步IO+连接池  {#persistent-connection-and-async-io-and-connection-pool}

在**长连接+同步IO+连接池**的基础上，将同步IO改为异步IO。

1. 简单性(---)：异步获取结果使得编程模型变得更为复杂，当然不排除一些编程语言提供一些简洁的语法形式。
2. 网络性能(不变)。
3. 网络效率(不变)。
4. 用户感知的性能(+)：得益于异步IO，可以把串行的同步IO所消耗的时间进行合并。比如一个操作需要一个1秒的IO和一个2秒的IO，假设其没有依赖关系，那么同步的情况下最少也是1+2=3秒；而异步IO则是可以达到2秒（两次IO种时间最长的那个）。

# 2 服务端 {#server}

## 2.1 单线程+同步IO {#single-thread-and-sync-io}

也是从最基本的开始。只有一个线程，而且是同步IO。

1. 简单性(+)：超级简单。
2. 网络性能(+)：没有额外的开销。
3. 网络效率(--)：只能串行一次处理一个client，严重浪费。
4. 用户感知的性能(--)：client不得不排队等待。

## 2.2 多线程+同步IO {#multi-thread-and-sync-io}

在**单线程+同步IO**的基础上，一个线程（或者协程\纤程）处理一个连接。

1. 简单性(+)：相对也比较简单。
2. 网络性能(+)：同样没有额外的开销。
3. 网络效率(+)：可以同时处理多个client连接。
4. 用户感知的性能(+)：client不再需要排队等待。

比如tomcat。

## 2.3 单线程+IO Multiplexing {#single-thread-and-io-multiplexing}

在**单线程+同步IO**的基础上。除了采用多线程的方式外，还可以采用IO Multiplexing的方式。

1. 简单性(+)：相对也比较简单。
2. 网络性能(+)：同样没有额外的开销。
3. 网络效率(+)：可以一次性串行处理多个client连接。
4. 用户感知的性能(+)：client不再需要排队等待。

比如redis。

## 2.4 多线程+IO Multiplexing {#multi-thread-and-io-multiplexing}

**多线程+同步IO**各方面比较均衡，但是其有个组大的缺点，就是无法支撑更多的client连接。原因在于维护多个线程的成本高昂，那么把同步IO换成IO Multiplexing，就可以享受到这两方面的优势了。

1. 简单性(+)：相对也比复杂。
2. 网络性能(+)：对于单一连接来说性能会略微下降，因为其处理流程变得更复杂了；但是server可以处理更多的并发了。
3. 网络效率(+)：可以同时并行处理多个client连接。
4. 用户感知的性能(+)：client不再需要排队等待。

比如netty。

# 3 总结 {#summary}

未完待续。。。

# 4 参考 {#reference}

[^io-model]:IO模型：<https://linianhui.github.io/computer-networking/io-model/>
[^socket]:Socket 基础：<https://linianhui.github.io/computer-networking-programming/socket/>
[^io-multiplexing]: IO模型-IO多路复用：<https://linianhui.github.io/computer-networking-programming/io-multiplexing/>
[^architectural-properties-of-key-interest]:基于网络应用的关键架构属性：<https://linianhui.github.io/understand-rest/03-network-based-software-architecture/#architectural-properties-of-key-interest>
[^client-server]:基于网络应用的架构风格-C/S风格
 <https://linianhui.github.io/understand-rest/04-network-based-software-architecture-style/#client-server>
[^pool-sizing]:You want a small pool, saturated with threads waiting for connections：<https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing>