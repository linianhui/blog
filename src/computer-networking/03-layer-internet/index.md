---
title: "[计算机网络] 03 [Layer] Internet"
created_at: 2019-09-22 08:13:00
tag: ["IP","IPv4","IPv6"]
toc: true
---


# 1 网络层的用途 {#internet-purpose}

上一篇中遗留了一部分问题 : `Frame`的丢失、乱序和重复等等，在网络层这里其实也无能为力😂😂😂。因为网络层解决的问题重点是**分组&交换**中的**交换**问题。虽然在数据链路层有交换机这样的设备负责`Frame`的转发和交换，但是它其实并无法满足我们的需要，那么为什么呢？我们来看一下基于`Frame`的转发交换存在哪些问题先：

1. `Frame`的`MAC`不是真正含以上的地址 : 虽然`MAC`也叫做**物理地址**，不过它其实并不是真正的地址。我们通常意义上的地址是什么呢？比如你要给故宫博物院的院长写一封信，那么信封上的信息大致是这样的:
    ```txt
    邮编     : 100009 
    收件人地址 : 北京市 东城区 景山前街4号 故宫博物院
    收件人    : 院长
    寄件人地址 : xxx yyy zzz
    寄件人    : abc 
    ```
    其中`北京市 东城区 景山前街4号 故宫博物院`这部分是真正意义上的地址，这部分信息是包含层级信息的，其目的是便于快速的定位。留意下邮编`100009`，这个其实也是地址，它也是层级的。
2. `MAC`是固化到硬件中的，不便于控制和管理。

基于以上两个核心的问题，二层的交换机如果想要完成我们想要的转发和交换，那么它的`MAC Address Table`将会多么的巨大（`MAC`地址有2<sup>48</sup>个，因为`MAC`没有层级，所以就无法分层处理转发和交换）。当然还有其他的原因，这里只是笔者的理解的一部分。

所以我们需要一个像邮编一样的**包含位置信息的并且分层的地址**来处理数据的转发和交换。**那么网络层的用途就是实现转发和交换**。

# 2 IP(Internet Protocol) {#internet-protocol}

`IP`(Internet Protocol)[^ip]是网络层定义的为了实现转发和交换的协议。通常我们也把`IP Address`称为`IP`，从设计之初`IP`就是一个**包含位置信息的并且分层的地址**。
网络层的`PDU`称之为`Packet`(包)，IP数据包或者IP数据报。目前`IP`有两个版本:

1. IPv4[^ipv4] : 长度`4 octet = 32 bit`，可容纳2<sup>32</sup>=`4,294,967,296`个地址，42亿+。
2. IPv6[^ipv6] : 长度`16 octet = 128 bit`，可容纳2<sup>128</sup>=`340,282,366,920,938,463,463,374,607,431,768,211,456`个地址，我数不过来了。。。

## 2.1 IPv4 Packet {#ipv4-packet}

IPv4的Packet[^ipv4-packet]:

{{<highlight-file file="ipv4-packet.txt" lang="txt">}}

看起来很复杂的样子(其实就是很复杂...)，我们这里只关注几个重点的就可以了。

1. Total Length : 长度
2. TTL : Time To Live, Packet的生存时间，每经过一跳就减一，减到0就丢弃。
3. Protocol : 上层协议的类型。
4. Source IP Address : 源IP地址
5. Destination IP Address : 目标IP地址
6. Payload : 有效的负载数据部分。

### 2.1.1 TTL Field {#ipv4-packet-ttl-field}

为了防止`Packet`在转发过程中出现死循环回路，设置的一个值，一般默认是64，转发一次就减1，直到为0就丢弃掉。

### 2.1.2 Protocol Field {#ipve-packet-protocol-field}

常见到的几个Protocol的值如下:

| Value | Protocol                                |
| :---- | :-------------------------------------- |
| 1     | ICMP Internet Control Message Protocol  |
| 2     | IGMP Internet Group Management Protocol |
| 6     | TCP Transmission Control Protocol       |
| 17    | UDP User Datagram Protocol              |

## 2.2 IPv6 Packet {#ipv6-packet}

随着互联网的迅猛发展，`IPv4`的2<sup>32</sup>=`4,294,967,296`个地址(42亿+)是远远不够的，期间开发出了[NAT][nat]来缓解IPv4的问题，但是始终不是彻底解决问题的办法。故而早在1992年IEEE就着手开发下一代的`IP`了，于1996年发布了`IPv6`[^ipv6]，把地址长度从32bit扩充到了128bit。同时也改进了一些之前`IPv4`协议族相关的一些不足之处。比如固定了协议的Header部分的长度(便于转发交换`Packet`)等等。

IPv6的Packet[^ipv6-packet]:

{{<highlight-file file="ipv6-packet.txt" lang="txt">}}


待补充...

# 3 Referance {#reference}

[^ip]:Internet Protocol: <https://en.wikipedia.org/wiki/Internet_Protocol>
[^ipv4]:IPv4 : <https://en.wikipedia.org/wiki/IPv4>
[^ipv4-packet]: IPv4 Packet : <https://github.com/linianhui/networking/blob/master/1-src/networking.model/Internet/IPv4Packet.Layout.cs>
[^ipv6]:IPv6 : <https://en.wikipedia.org/wiki/IPv6>
[^ipv6-packet]: IPv6 Packet : <https://github.com/linianhui/networking/blob/master/1-src/networking.model/Internet/IPv6Packet.Layout.cs>

[nat]:<../nat>