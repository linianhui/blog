---
title: "[计算机网络] NAT"
created_at: 2020-02-20 21:20:00
tag: ["NAT","SNAT","DNAT","PAT","NAPT"]
toc: true
---
  
# 1 NAT {#nat}

`NAT`(Network Address Translation)[^nat] : 网络地址转换。是一种重写 `IP Packet` 的 `Source IP` 或 `Destination IP` 的技术，用来解决私有地址无法和外部通信的问题，也大大的缓解了IPv4的枯竭问题，同时促进了互联网的蓬勃发展。

假设原始的 `IP Packet` 如下 : 

| Source IP   | Destination IP |
| :---------- | :------------- |
| 192.168.2.2 | 9.9.9.9        |

## 1.1 SNAT {#snat}

`SNAT`(Source Network Address Translation) : 源地址转换，重写的是 `Source IP`。

重写后如下 : 

| Source IP                            | Destination IP |
| :----------------------------------- | :------------- |
| <font color='#DC143C'>1.1.1.1</font> | 9.9.9.9        |


## 1.2 DNAT {#dnat}

`DNAT`(Destination Network Address Translation) : 目标地址转换，重写的是 `Destination IP`。

重写后如下 : 

| Source IP   | Destination IP                       |
| :---------- | :----------------------------------- |
| 192.168.2.2 | <font color='#009a61'>2.2.2.2</font> |


# 2 PAT {#pat}

`PAT`(Port Address Translation) : 端口地址转换(或者称为`Port Forwarding`)，是一种重写传输层的 `Source Port` 或者 `Destination Port` 的技术（隶属于 `NAT` 体系）。

假设原始的数据包如下 : 

| Source IP   | Source Port | Destination IP | Destination Port |
| :---------- | :---------- | :------------- | :--------------- |
| 192.168.2.2 | 6666        | 9.9.9.9        | 80               |

`Destination Port`重写后如下 : 

| Source IP   | Source Port | Destination IP | Destination Port                  |
| :---------- | :---------- | :------------- | :-------------------------------- |
| 192.168.2.2 | 6666        | 9.9.9.9        | <font color='#1C86EE'>8080</font> |

# 3 NAPT {#napt}

通常情况下NAT和PAT会被同时搭配组合使用, 这时通常称为 `NAPT`(Network Address Port Translation)。

比如最常见的例子是重写私有地址端口`192.168.2.2:6666`为公网的IP和端口`1.1.1.1:7777`，以此可以实现私有地址访问公网的目的。重写后如下 : 

| Source IP                            | Source Port                       | Destination IP | Destination Port |
| :----------------------------------- | :-------------------------------- | :------------- | :--------------- |
| <font color='#DC143C'>1.1.1.1</font> | <font color='#1C86EE'>7777</font> | 9.9.9.9        | 80               |


或者重写目标地址的IP和端口号。比如把发往 `9.9.9.9:80` 的数据重写为发往 `2.2.2.2:8080`，以此可以可以实现数据包转发的目的（如果可以动态的轮询转发给多个IP, 则也可以实现负载均衡的目的）。重写后如下 : 

| Source IP   | Source Port | Destination IP                       | Destination Port                  |
| :---------- | :---------- | :----------------------------------- | :-------------------------------- |
| 192.168.2.2 | 6666        | <font color='#009a61'>2.2.2.2</font> | <font color='#1C86EE'>8080</font> |


根据NAPT设备对转换的策略，可以得到一下4种类型的NAPT。示例如下 : 

{{<inline-html path="napt.html">}}

## 3.1 Cone NAT {#cone-nat}

由 `Source` 方发送数据包触发，根据 `Source IP:Source Port` 为唯一标识，在NAPT中建立映射关系(即使 `Destination` 不同也只会建立一个映射关系)。

### 3.1.1 Full Cone NAT {#full-cone-nat}

映射建立后，允许外部的 <font color='#009a61'>Any IP</font> : <font color='#009a61'>Any Port</font> 访问映射的 `NAT IP:NAT Port`。

![Full Cone NAT](full-cone.svg)

### 3.1.2 Address Restricted Cone NAT {#address-restricted-cone-nat}

映射建立后，允许外部的 <font color='#EEC900'>Destination IP</font> : <font color='#009a61'>Any Port</font> 访问映射的 `NAT IP:NAT Port`。

![Address Restricted Cone NAT](address-restricted-cone.svg)

### 3.1.3 Address Port Restricted Cone NAT {#address-port-restricted-cone-nat}

映射建立后，允许外部的 <font color='#EEC900'>Destination IP</font> : <font color='#EEC900'>Destination Port</font> 访问映射的 `NAT IP:NAT Port`。

![Port Restricted Cone NAT](address-port-restricted-cone.svg)

## 3.2 Symmetric NAT {#symmetric-nat}

由`Source`方发送数据包触发，根据 `Source IP:Source Port` 和 `Destination IP:Destination Port` 为唯一标识，在NAPT中建立映射关系。

映射建立后，允许外部的 <font color='#EEC900'>Destination IP</font> : <font color='#EEC900'>Destination Port</font> 访问映射的 `NAT IP:NAT Port`。

![Symmetric NAT](symmetric.svg)


# 4 Reference {#reference}

[^nat]:NAT : <https://en.wikipedia.org/wiki/Network_address_translation>

<https://tools.ietf.org/html/rfc2663>

<https://www.youtube.com/watch?v=QBqPzHEDzvo>

<https://www.youtube.com/watch?v=wg8Hosr20yw>
