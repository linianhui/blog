---
title: "[计算机网络] TCP"
created_at: 2020-02-20 20:55:00
tag: ['tcp','full duplex','segment','pcap','syn','ack','fin','time_wait','rwnd','cwnd']
toc: true
displayed_on_home: true
---

TCP(Transmission Control Protocol)是一种**全双工的**、**面向连接的**、**基于字节流的**、**可靠的（尽最大努力交付）**、**有状态的** 传输层通信协议。先看一TCP的数据包`Segment`[^segment]长什么样子，后续的各种功能都会体现在其中：
{{<highlight-file path="tcp.segment" lang="txt">}}

# 1 特点介绍 {#feature}

1. **全双工的**：通信双方在同一时刻都可以发送和接收数据。
2. **面向连接的**：在双方通信之前，必须要建立一条通道，这个通道并不是说要铺设一条物理线缆，而是一条**逻辑通道**。
3. **基于字节流的**：底层的通信基础基于`分组交换`[^packet-switching]，数据是分成一组一组的，而TCP则是屏蔽了底层这些细节，而像上层提供了一个类似队列一样的byte-stream。
4. **可靠的（尽最大努力交付）**：由于`分组交换`和网络的天然不可靠状态，所以TCP只能做到尽最大努力可靠。
5. **有状态的**：通信双方需要维持连接的状态。

# 2 连接管理 {#connection-management}

既然是面向连接的协议，那么TCP就需要负责连接的创建、维护和关闭等操作。下图是TCP的状态迁移流程图。

![TCP State Diagram](state-diagram.svg)

这里我们通过`tcpdump port 80 -w nginx.pcap`[^tcpdump]来抓取访问Nginx首页(`curl http://172.17.0.2`)这一过程的数据包[nginx.pcap](nginx.pcap)来分析一下TCP的建立连接、传输数据和关闭连接的过程中的关键信息。下面的信息是`tcpdump -r nginx.pcap -nSt`的打印结果。

{{<highlight-file path="nginx.pcap.txt" lang="txt">}}

其中的关键信息：
1. `ip`，`port`：通信双方的ip和port。
2. `flags`：`S=SYN`，`.=ACK`，`P=PSH`，`F=FIN`。标记位，每个标记1bit，代表不同的含义。
3. `seq`：`Sequence number (4 octets)`。序列号，长度32bit。 
4. `ack`：`Acknowledgment number (4 octets)`。确认号，长度32bit。
5. `win`：`Window Size (2 octets)`。窗口大小，长度16bit。
6. `length`：data部分的长度。
7. `wscale`：Window Scale 窗口缩放因子。用于解决win太小的问题。

## 2.1 连接数 {#connection-number}

**理论上一台服务器最大可以支持多少个TCP连接呢**？TCP使用四元组 (`source_ip`, `source_port`, `destination_ip`, `destination_port`) 标识一个连接。

假设服务器只有一个IP`172.17.0.2`，端口号固定是`80`。那么`destination_ip`, `destination_port`) 就是固定的。因此最大连接数=`source_ip`的数量乘以`source_port`的数量。

1. IPv4 : <code>2<sup>32</sup> * 2<sup>16</sup> = 2<sup>48</sup> = 40亿+</code>
2. IPv6 : <code>2<sup>128</sup> * 2<sup>16</sup> = 2<sup>144</sup></code>

单单IPv4就可以支持多大40亿+的连接了。但是有时候才1000多个连接就会遇到这样的错误`Socket : Can't open so many files`。这是因为Linux系统默认限制了一个进程可以打开的fd(文件描述符：一个连接对应一个文件描述符)数量，其默认值是`1024`。
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

TCP是基于`ACK`（收到数据后需要回复确认）的协议，并且是`全双工的`的协议，那么通信双方均需要确认`自身`和`对方`都具备`发送`和`接收`数据的能力。按最简化的模型来说需要<mark>4步</mark>才能建立连接。如下图，`A`和`B`是通信双方：

![4 step handshake](4-step-handshake.svg)

聪明的你明显就可以看出2和3可以合并处理，从而变成<mark>3步</mark>握手。至此双方都可以确认自身和对方的收发功能是正常的。

{{<inline-html path="3-step-handshake.html">}}

那么我们就详细分析下上文的`nginx.pcap.txt`这部分tcpdump的结果的前3行。

1. 01行：client使用了一个随机的端口`40278`来连接server的`80`端口。设置了`SYN`flags（表示自己要求建立连接）；生成了一个随机的`seq`=`c`=4068139125；`win`=64240，`length`=0（建立连接阶段不携带数据，故而为0）。client此时进入`SYN_SENT`状态。
2. 02行：server设置了`SYN`和`ACK`flags（表示我已收到你的建立连接请求，并且同意建立连接）。同时生成了自己的`seq`=`s`=4161524589；然后设置`ack`=4068139126（=`c+1`），虽然client没有发送data，但是握手阶段依然会增加1byte的ack；`win`=65160；`length`=0。server此时进入`SYN_RECEIVED`状态。
3. 03行：client设置了`ACK`flags，然后设置`ack`=4161524590（=`s+1`），`win`=502，`length`=0。此时client到`ESTABLISHED`状态，表示连接已经建立。

在server收到03的数据后，也会进入到`ESTABLISHED`状态。
## 2.3 传输数据 {#transfer-data}

上文的`nginx.pcap.txt`的04行到09行均是实质性的数据传输部分。

4. 04行：client设置了`PSH`和`ACK`的flags。`PSH`的含义是指示server在收到数据后应该尽快交付给上层应用。`seq 4068139126:4068139200`看起来有点奇怪，不过其实际的seq是`4068139126`，冒号后面的数字是tcpdump用seq加length`74`自己计算出来的。ack`4161524590`和03行一样，因为目前还未收到server的数据，故而保持不变。
5. 05行：server回复了一个ack`4068139200`，表示自己收到了你的seq`4068139126`+length`74`这部分数据了。
6. 06行：server开始返回的数据，seq`4161524590`，length`238`。同时也携带了一个和05行一样的ack。
7. 07行：client收到了server发送的seq`4161524590`+length`238`的数据，回复了一个ack`4161524828`。
8. 08行：server继续返回数据，这次是length`612`。
9. 09行：client收到了612的数据，回复ack`4161525440`=`4161524828+612`。

## 2.4 关闭连接 {#close-connection}

TCP是`全双工的`，通信双方可以进行独立的关闭（半关闭：half-clone）。A方发送`FIN`只是代表A不再发送数据了，但是还可以接收B方发送的数据。当B收到A的`FIN`时：B需要给A发送一个ACK；但是TCP并不知道B方是否也需要关闭，而是要由上层应用来决定，故而不能像建立连接时直接在协议层面就规定直接合并`ACK`和`FIN`。所以关闭时需要<mark>4步</mark>。但是如果B收到A的关闭请求时，正正好自己也要关闭，那么其实现实中是可以合并成<mark>3步</mark>（上文的`nginx.pcap.txt`的最后三行）。

10.  10行：client主动发起关闭，设置了`FIN`flags（表示自己要求断开连接），seq`4068139125`，client此时进入`FIN_WAIT_1`状态。此时client还能接收server发送的数据，但是自己已经不能发送了。
11.  11行：server碰巧这时候也要关闭连接，所以合并了对10行的ack和自己的`FIN`。server此时直接进入`LAST_ACK`状。
    > 如果server现在不想关闭连接，那么只对client的`FIN`回复ACK时，则是进入到`CLOSE_WAIT`状态，此时自身还可以继续发送数据给client。当自己也发送了`FIN`后，才会进入到`LAST_ACK`状态，这时server已经不能再发送数据了。
12.  12行：client同时收到了server的`ACK`和`FIN`。然后发出对server的`FIN`的最后一个`ACK`，此时cleint进入`TIME_WAIT`状态。通常此时client都会维持这个状态2`MSL`[^msl]时长后才会进入到`CLOSED`状态。
    > 两种特殊情况：
    > 1. client这时只收到了`ACK`，但是没有收到`FIN`，也就是说server目前还不想关闭连接，那么此时client进入到`FIN_WAIT_2`状态，这时client还依然可以接收server发送的数据。当收到server的`FIN`时，才会进入到`TIME_WAIT`状态。
    > 2. client这时只收到server的`FIN`，但是没有收到自己的`FIN`的`ACK`，非常罕见的情况，此时client会进入到`CLOSING`状态，待收到`ACK`后，进入到`TIME_WAIT`状态。

最后，server收到了client的ack，server则进入到`CLOSED`状态，致此server端已经彻底关闭连接。


# 3 流量控制 {#flow-control}

TCP是基于底层的分组交换向上层提供基于字节流的数据服务的。因为底层分组交换的特性，所以双方收到的Segment的顺序并不一定是对方发送的顺序；也由于底层网络的不可靠性，甚至出现丢包需要重传的现象。同时底层硬件的所支持的网络速率也不尽相同。还有就是即使数据已经收到了，但是上层应用并未来得及去处理。

基于这些客观因素，则TCP协议的实现程序中就有必要设置一定的接收缓冲区，用来暂存收到的数据。
> 也有发送缓冲区，意思是上层应用交给TCP的数据并不一定立即就会发送出去，TCP自身可以自由决定分组发送。

既然有了缓冲区，那么肯定就会有上限容量。如果己方接收缓冲区满了，上层应用来不及去读取，而对方还在不停的发送数据，则这部分数据就只能被丢弃，导致浪费。所以就需要一种途径来告诉对方自身的接收缓冲区有多大。**在Segment中的`Window Size`就是干这个的，大小为16bit，单位是byte，最大64Kb。在建立连接的3步握手时，双方除了交换自身的seq外，还交换了这个信息**。Window Size并不是固定不变的，而是会动态变化的，比如一开始64kb，收到了64kb，但是上层应用一直没有去读取，这时就变成了0kb。这个0kb的值会随着ack告知对方，对方发现已经是0，就会选择暂停发送，以等待下次窗口变化。这里的Window Size因为是接收窗口，故而称之为<mark>rwnd</mark>(receive window)。
> rwnd变成0后，发送会也会选择定时的发送一个称为`ZWPs=Zero Window Probes`的包，让接收方来ACK一下其窗口的变化。如果经过几次ZWP依然是0，那么发送方就会选择`RST`掉这次连接。

64kb的大小对于现在的应用来说太小了，但是TCP上只给它分配了16bit，只能这么多，怎么办？这时就需要Segment中的可选部分option区域登场了，可以在连接时设置option，其中包含`wscale 7`。代表的含义时说`Window Size`的实际大小应该扩大<code>2<sup>7</sup>=128</code>倍。这个机制称之为`TCP Window Scale`[^window-scale]。

那么rwnd通常设置多大合适呢？通常是取决于`BDP=Bandwidth Delay Product`（带宽和延迟的乘积）[^bdp]的大小。比如`Bandwidth`[^bandwidth]是100Mbps，`Delay`[^delay]是100ms，那么BDP为：
```sh
BDP = 100Mbps * 100ms = (100 / 8) * (100 / 1000) = 1.25MB
```
如果想要尽可能的跑慢带宽，那么rwnd不应该低于1.25MB。注意`Window Size`最大只是64kb，这时就需要`TCP Window Scale`来搭配了。

# 4 拥塞控制 {#congestion-control}

单单有了<mark>rwnd</mark>还是远远不够的，因为它只是通信双方自身接收窗口的信息，而不知道实际的网络情况到底如何。就好比北京和广州两个仓库之间交换货物，仅知道了对方的仓库容量可以容纳得下自己的货物了。但是不知道两地之间的高速路上是不是畅通无阻，还是已经拥挤不堪了，如果此时选择大规模的上高速，那么只会让高速变得更加拥堵。

所以就需要另外一个能够实时反映线路拥堵情况的指标来指导双方应该以何种速率来发送数据。这个重要的指标就是<mark>cwnd</mark>(congestion window)。这个指标参数只是发送方内部自己根据`RTT`[^rtt]以及`ACK`的情况估算出来的，并不体现在TCP的`Segment`中。也是因为它是算出来的，故而相关的解决方案都称之为算法。

## 4.1 慢启动算法 {#slow-start}

在刚开始传输数据时，保守一些，假设网络是拥挤的，先发送少量的数据试探一下，根据对方的ACK以及RTT来判断后续是否可以加大发送的数据量。具体的过程如下：
1. 默认`cwnd=1`MSS[^mss]。根据google的研究[^google-cwnd]，目前默认已经是10。
2. 收到一个ACK：`cwnd++`线性上升。
3. 经过一个RTT：`cwnd=cwnd*2`指数让升。
4. `cwnd >= ssthresh`(slow start threshold)时，换成[拥塞避免算法](#congestion-avoidance)。

## 4.2 拥塞避免算法 {#congestion-avoidance}

当cwnd超过ssthresh后，改成如下方式处理：

1. 收到一个ACK：`cwnd = cwnd + 1/cwnd`
2. 经过一个RTT：`cwnd = cwnd + 1`

避免增长过快导致网络拥塞，慢慢的增加。

未完待续。
# 5 Reference {#reference}

常用到的一些配置信息：
{{<highlight-file path="sysctl.conf" lang="ini">}}

<http://www.52im.net/thread-561-1-1.html>
<http://www.52im.net/forum.php?mod=viewthread&tid=515>

<https://zhuanlan.zhihu.com/p/144273871>

[^packet-switching]:分组交换：<https://linianhui.github.io/computer-networking/00-overview/#packet-switching>
[^segment]:Segment：<https://linianhui.github.io/computer-networking/00-overview/#layered-architecture>
[^tcpdump]:tcpdump：<https://www.tcpdump.org>
[^msl]:`MSL=Maximum Segment Lifetime`：<https://en.wikipedia.org/wiki/Maximum_segment_lifetime>
[^window-scale]:Window Scale Option：<https://en.wikipedia.org/wiki/TCP_window_scale_option>
[^rtt]:`RTT=Round Trip Time`：<https://linianhui.github.io/computer-networking/00-overview/#round-trip-time>
[^bdp]:`BDP=Bandwidth Delay Product`：<https://en.wikipedia.org/wiki/Bandwidth-delay_product>
[^bandwidth]:带宽：<https://linianhui.github.io/computer-networking/00-overview/#bandwidth>
[^delay]:延迟：<https://linianhui.github.io/computer-networking/00-overview/#delay>
[^google-cwnd]:<https://static.googleusercontent.com/media/research.google.com/zh-CN//pubs/archive/36640.pdf>
[^mss]:`MSS=Maximum Segment Size`：<https://en.wikipedia.org/wiki/Maximum_segment_size>