---
title: "[计算机网络] TCP"
created_at: 2020-02-20 20:55:00
tag: ["tcp"]
toc: true
---

TCP(Transmission Control Protocol)是一种**全双工的**、**面向连接的**、**基于字节流的**、**可靠的（尽最大努力交付）**、**有状态的** 传输层通信协议。先看一TCP的数据包`Segment`[^segment]长什么样子，后续的介绍都会基于此：
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

这里我们用`tcpdump port 80 -w nginx.pcap`[^tcpdump]来抓一个访问Nginx服务器首页(`curl http://172.17.0.2`)的[nginx.pcap](nginx.pcap)包来分析一下其中的关键信息。下图是`tcpdump -r nginx.pcap -nSt`的打印结果。

{{<highlight-file path="nginx.pcap.txt" lang="txt">}}

其中的关键信息：
1. `ip`，`port`：通信双方的ip和port。
2. `flags`：`S=SYN`，`.=ACK`，`P=PSH`，`F=FIN`。标记位，每个标记1bit，代表不同的含义。
3. `seq`：`Sequence number (4 octets)`。序列号，长度32bit。 
4. `ack`：`Acknowledgment number (4 octets)`。确认号，长度32bit。
5. `win`：`Window Size (2 octets)`。窗口大小，长度16bit。
6. `length`：data部分的长度。

## 2.1 连接数 {#connection-number}

**理论上一台服务器最大可以支持多少个TCP连接呢**？TCP使用四元组 (`source_ip`, `source_port`, `destination_ip`, `destination_port`) 标识一个连接。

假设服务器只有一个IP`172.17.0.2`，端口号固定是`80`。那么`destination_ip`, `destination_port`) 就是固定的。因此最大连接数=`source_ip`的数量乘以`source_port`的数量。

1. IPv4 : <code>2<sup>32</sup> * 2<sup>16</sup> = 2<sup>48</sup> = 40亿+</code>
2. IPv6 : <code>2<sup>128</sup> * 2<sup>16</sup> = 2<sup>144</sup></code>

单单IPv4就可以支持多大40亿+的连接了。但是有时候才1000多个连接就会遇到这样的错误`Socket : Can't open so many files`。这是因为Linux系统默认限制了一个进程可以打开的fd(文件描述符，一个连接对应一个文件描述符)数量，其默认值是`1024`。
```sh
# 查看默认限制
ulimit -n
1024

# 临时修改
ulimit -n 1024000
# 查看修改
ulimit -n
1024000
```

## 2.2 建立连接 {#establish-connection}

TCP是基于`ACK`的协议，并且是[全双工的](#full-duplex)的协议，那么通信双方均需要确认`自身`和`对方`都具备`发送`和`接收`数据的能力。按最简化的模型来说需要<mark>4步</mark>才能建立连接。如下图，`A`和`B`是通信双方：

![4 step handshake](4-step-handshake.svg)

聪明的你明显就可以看出2和3可以合并处理，从而变成<mark>3步</mark>握手。至此双方都确认了自身和对方的收发功能是正常的。

{{<inline-html path="3-step-handshake.html">}}

那么我们就详细分析下上文的`nginx.80`这部分tcpdump的结果的前3行。

1. **IP 172.17.0.3.40230 > 172.17.0.2.80: Flags [S], seq 2268499507, win 64240, options [mss 1460,sackOK,TS val 685088562 ecr 0,nop,wscale 7], length 0**：client使用了一个随机的端口`40230`来连接server的`80`端口，同时设置了`SYN`flags（表示自己要求建立连接），随机的`seq`为`2268499507`，`win`为`64240`，`length`为0（建立连接阶段不携带数据，故而为0）。
1. **IP 172.17.0.2.80 > 172.17.0.3.40230: Flags [S.], seq 2967367134, ack 2268499508, win 65160, options [mss 1460,sackOK,TS val 710931729 ecr 685088562,nop,wscale 7], length 0**：server设置了`SYN`和`ACK`flags（表示我已收到你的建立连接请求，并且同意建立连接）,同时生成了自己的`seq`为`2967367134`，然后设置`ack`为`2268499508`（client的seq`2268499507+1`），`win`为`65160`，`length`也是0。
2. **IP 172.17.0.3.40230 > 172.17.0.2.80: Flags [.], ack 2967367135, win 502, options [nop,nop,TS val 685088562 ecr 710931729], length 0**：client设置了`ACK`flags，然后设置`ack`为`2967367135`（server的seq`2967367134+1`），`win`为`502`，`length`也是0。

## 2.3 传输数据 {#transfer-data}



## 2.4 关闭连接 {#close-connection}

TCP是[全双工的](#full-duplex)，通信双方需要进行独立的关闭（半关闭：half-clone）。A方发送`FIN`只是代表A不再发送数据了，但是还可以接收B方发送的数据。当B收到A的`FIN`时：B需要给A发送一个ACK；但是TCP并不知道B方是否也需要关闭，而是要由上层应用来决定；故而不能像建立连接时那样合并ACK和自身的`FIN`。所以关闭时需要<mark>4步</mark>，但是如果B收到A的关闭请求时，正正好自己也要关闭，那么其实也是可以合并成<mark>3步</mark>（上文的`nginx.80`的最后三行）。

# 3 流量控制 {#flow-control}

# 4 拥塞控制 {#congestion-control}

## 4.1 慢启动 {#slow-start}
## 4.2 拥塞避免 {#congestion-avoidance}
## 4.3 快速恢复 {#fast-recovery}

# 5 Reference {#reference}

<http://www.52im.net/thread-561-1-1.html>

[^packet-switching]:<https://linianhui.github.io/computer-networking/00-overview/#packet-switching>
[^segment]:<https://linianhui.github.io/computer-networking/00-overview/#layered-architecture>
[^tcpdump]:<https://www.tcpdump.org>
