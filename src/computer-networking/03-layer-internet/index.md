---
title: "[计算机网络] 03 [Layer] Internet"
created_at: 2019-09-22 08:13:00
tag: ["IP","IPv4","IPv6"]
toc: true
displayed_on_home: true
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

所以我们需要一个像邮编一样的**包含位置信息的并且分层的地址**来处理数据的转发和交换。**那么网络层的用途就是实现转发和交换，向上层提供无连接的、尽最大努力交付的分组数据报服务**。

# 2 IP(Internet Protocol) {#internet-protocol}

`IP`(Internet Protocol)[^ip]是网络层定义的为了实现转发和交换的协议。通常我们也把`IP Address`称为`IP`，从设计之初`IP`就是一个**包含位置信息的并且分层的地址**。
网络层的`PDU`称之为`Packet`(包)，IP数据包或者IP数据报。目前`IP`有两个版本:

1. IPv4[^ipv4] : 长度`4 octet = 32 bit`，可容纳2<sup>32</sup>=`4,294,967,296`个地址，42亿+。
2. IPv6[^ipv6] : 长度`16 octet = 128 bit`，可容纳2<sup>128</sup>=`340,282,366,920,938,463,463,374,607,431,768,211,456`个地址，我数不过来了。。。

## 2.1 IPv4 Packet {#ipv4-packet}

IPv4的Packet[^ipv4-packet]:

{{<highlight-file path="ipv4-packet.txt" lang="txt">}}

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

{{<highlight-file path="ipv6-packet.txt" lang="txt">}}


# 3 IP Address {#ip-address}

IP Address由`Network Id`(网络号)和`Host Id`(主机号)两部分组成，所以IP不仅仅是一个唯一标识一台主机，也包含其所在的网络。这就是开篇所提到的分层的地址，这样划分有2个重要的意义：

1. IP的分组数据报只根据`Network Id`进行路由转发，而且`Network Id`也是分层级处理的，这就使得路由可以不必处理所有的IP。不然现实世界是无法实现这样的路由转发设备的。
2. IP地址的分配机构只管分配`Network Id`部分即可。


## 3.1 IPv4 Address {#ipv4-address}

IPv4长度为4octet=32bit。按照传统的网络分类[^classful-network]方式把IP分为了ABCDE五类。划分方式:

{{<inline-html path="classful-network.html">}}

地址数量和范围:

| Class | Network Count            | One Network IP Count      | IP Range                  | Default Subnet Mask |
| :---- | :----------------------- | :------------------------ | :------------------------ | :------------------ |
| A     | 128=2<sup>7</sup>        | 16,777,216=2<sup>24</sup> | 0.0.0.0~127.255.255.255   | 255.0.0.0           |
| B     | 16,384=2<sup>14</sup>    | 65,536=2<sup>16</sup>     | 128.0.0.0~191.255.255.255 | 255.255.0.0         |
| C     | 2,097,152=2<sup>21</sup> | 256=2<sup>8</sup>         | 192.0.0.0~223.255.255.255 | 255.255.255.0       |
| D     | N/A                      | N/A                       | 224.0.0.0~239.255.255.255 | N/A                 |
| E     | N/A                      | N/A                       | 240.0.0.0~255.255.255.255 | N/A                 |

### 3.1.1 Private IPv4 Addtess {#private-ipv4-addtess}

IP地址中保留了一部分私有网络地址[^private-network]，可以不用申请就可以直接使用:

| CIDR           | Network Count | IP Range                    | Default Subnet Mask | Total IP Count            | Class |
| :------------- | :------------ | :-------------------------- | :------------------ | :------------------------ | :---- |
| 10.0.0.0/8     | 1             | 10.0.0.0~10.255.255.255     | 255.0.0.0           | 16,777,216=2<sup>24</sup> | A     |
| 172.16.0.0/12  | 16            | 172.16.0.0~172.31.255.255   | 255.240.0.0         | 1,048,576=2<sup>20</sup>  | B     |
| 192.168.0.0/16 | 256           | 192.168.0.0~192.168.255.255 | 255.255.0.0         | 65,536=2<sup>16</sup>     | C     |

## 3.2 CIDR {#cidr}

在IPv4 Addres的ABCEDE分类方式过于死板，网络号只能是8、16、24位，无法有效的对IP地址进行分类和路由。故而在1993年推出了CIDR(Classless Inter-Domain Routing)[^cidr]，中文含义是**无类别域间路由**。CIDR使用VLSM(可变长度子网掩码)来进行子网划分，可以按照IP的每一个bit来分割子网，比传统的ABCDE的方式灵活太多了。而且可以方便的进行网络的聚合。比如:

1. `192.168.1.0/29`: 子网掩码是`255.255.255.248`）, 包含2<sup>32-29=3</sup>=8个IP(`192.168.1.0`~`192.168.1.7`)。
2. `192.168.1.8/29`: 子网掩码是`255.255.255.248`）, 包含2<sup>32-29=3</sup>=8个IP(`192.168.1.8`~`192.168.1.15`)。

`192.168.1.0/29`和`192.168.1.8/29`可以聚合为`192.168.1.0/28`，聚合后的子网掩码是`255.255.255.240`, 包含2<sup>32-28=4</sup>=16个IP(`192.168.1.1`~`192.168.1.15`)

## 3.3 IPv6 Address {#ipv6-address}

待补充...

## 3.4 特殊的IP Address {#special-address}

RFC5735[^rfc5735]定义了一些特殊的IP地址。常用的一些如下。
### 3.4.1 Loopback Address {#loopback-adress}

中文称为**回环地址**[^loopback]。回环的意思是说任何发往这个地址的数据，都不会被路由到网络上，而只会再次回到这个地址上来。

1. `IPv4`: `127.0.0.1/8`。
2. `IPv6`: `::1/128`。

> 这里指的是一个<mark>地址块</mark>，并不是一个地址，比如`127.1.2.3`也是回环地址，只是通常我们只用`127.0.0.1`就足够了。

### 3.4.2 Host Address {#host-address}

中文称为**主机地址**[^0-0-0-0]。代表的是本机上所有的网络接口的IP地址。比如本机有一个外部IP`1.2.3.4`，一个私有IP`192.168.1.2`，还有一个默认的回环地址`127.0.0.1`，那么**主机地址**代表的是上述3个IP。不同于`127.0.0.1`的是，当我们的应用监听`0.0.0.0`时，意味着使用上述例子中的3个地址都可以访问。

1. `IPv4`: `0.0.0.0`。
2. `IPv6`: 简写`::`, 完整`0000:0000:0000:0000:0000:0000:0000:0000`。

# 4 Referance {#reference}

[^ip]:Internet Protocol: <https://en.wikipedia.org/wiki/Internet_Protocol>
[^ipv4]:IPv4 : <https://en.wikipedia.org/wiki/IPv4>
[^ipv4-packet]:IPv4 Packet : <https://github.com/linianhui/networking/blob/master/1-src/networking.model/Internet/IPv4Packet.Layout.cs>
[^ipv6]:IPv6 : <https://en.wikipedia.org/wiki/IPv6>
[^ipv6-packet]:IPv6 Packet : <https://github.com/linianhui/networking/blob/master/1-src/networking.model/Internet/IPv6Packet.Layout.cs>
[^classful-network]:Classful Network : <https://en.wikipedia.org/wiki/Classful_network>
[^private-network]:Private Network : <https://en.wikipedia.org/wiki/Private_network>
[^cidr]:Classless Internet Domain Routing : <https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing>
[^loopback]:Loopback Address : <https://en.wikipedia.org/wiki/Loopback#Virtual_loopback_interface>
[^0-0-0-0]:0.0.0.0 : <https://en.wikipedia.org/wiki/0.0.0.0>
[^rfc5735]:Special Use IPv4 Addresses : <https://tools.ietf.org/html/rfc5735>

[nat]:<../nat>