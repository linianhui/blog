---
title: "[计算机网络] TCP"
created_at: 2020-02-20 20:55:00
tag: ["tcp"]
toc: true
---

TCP是一种**全双工的**、**面向连接的**、**基于字节流的**、**可靠的（尽最大努力交付）**、**有状态的** 传输层通信协议。先看一TCP的数据包(Segment)长什么样子，后续的介绍都会基于此：
{{<highlight-file path="tcp.segment" lang="txt">}}

# 1 特点介绍 {#feature}

1. **全双工的**：全双工指的是通信双方在同一时刻都可以发送和接收数据。
2. **面向连接的**：面向连接的意思是说，在双方通信之前，必须要建立一条通道，这个通道并不是说要铺设一条物理线缆，而是一条**逻辑通道**。
3. **基于字节流的**：底层的通信基础基于`分组交换`[^packet-switching]，数据是分成一组一组的，而TCP则是屏蔽了底层这些细节，而像上层提供了一个类似队列一样的byte-stream。
4. **可靠的（尽最大努力交付）**：因为`分组交换`和网络的天然不可靠状态，所以TCP只能做到尽最大努力可靠。
5. **有状态的**：指的是通信双方需要维持连接的状态。

# 2 连接管理 {#connection-management}

既然是面向连接的协议，那么TCP就需要负责连接的创建、维护和关闭。下图是TCP的状态流程图。

![TCP State Diagram](state-diagram.svg)

## 2.1 最大连接数 {#max-connection-number}

那么理论上一个服务器最大可以支持多少个TCP连接呢？TCP使用四元组 (`source_ip`, `source_port`, `destination_ip`, `destination_port`) 标识一个连接。那么Server端 (`destination_ip`, `destination_port`) 固定，最大连接数=`source_ip`的数量乘以`source_port`的数量。

1. IPv4 : <code>2<sup>32</sup> * 2<sup>16</sup> = 2<sup>48</sup></code>
2. IPv6 : <code>2<sup>128</sup> * 2<sup>16</sup> = 2<sup>144</sup></code>

## 2.2 建立连接 {#establish-connection}

这里我们用`tcpdump`来抓一个TCP连接的包来分析一下其中的关键信息。

```sh

```

### 2.2.1 建立连接为什么需要`3步`握手 {#why-3-step-handshake-establish-connection}

TCP是[全双工的](#full-duplex)，通信双方需要确认`自身`和`对方`都具备`发送`和`接收`数据的能力。而 *`3步`* 握手是确认上述能力的最小交互步数。如下图，`A`和`B`是通信双方：

{{<inline-html path="3-step-handshake.html">}}

## 2.3 关闭连接 {#close-connection}

### 2.3.1 关闭连接为什么需要`4步`挥手 {#why-4-step-handshake-close-connection}

TCP是[全双工的](#full-duplex)，通信双方需要进行独立的关闭（半关闭：half-clone）。A方发送`FIN`只是代表A不再发送数据了，但是还可以接收B方发送的数据。当B收到A的`FIN`时：B需要给A发送一个ACK；但是TCP并不知道B方是否也需要关闭，而是要由上层应用来决定；故而不能像建立连接时那样合并ACK和自身的`FIN`。

# 3 流量控制 {#flow-control}

# 4 拥塞控制 {#congestion-control}

## 4.1 慢启动 {#slow-start}
## 4.2 拥塞避免 {#congestion-avoidance}
## 4.3 快速恢复 {#fast-recovery}

# 5 Reference {#reference}

<http://www.52im.net/thread-561-1-1.html>

[^packet-switching]:<https://linianhui.github.io/computer-networking/00-overview/#packet-switching>
