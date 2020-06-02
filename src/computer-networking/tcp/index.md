---
title: "[计算机网络] TCP"
created_at: 2020-02-20 20:55:00
tag: ["TCP"]
toc: true
---

# 1 TCP连接数 {#tcp-connections}

## 1.1 如何标识一个TCP连接 {#identifies-a-tcp-connection}

四元组 (`source_ip`, `source_port`, `destination_ip`, `destination_port`) 。

## 1.2 理论上的最大TCP连接数 {#theoretically-maximum-number-of-tcp-connections}

Server端 (`destination_ip`, `destination_port`) 固定，最大连接数=`source_ip`的数量乘以`source_port`的数量。

1. IPv4 : <code>2<sup>32</sup> * 2<sup>16</sup> = 2<sup>48</sup></code>
2. IPv6 : <code>2<sup>128</sup> * 2<sup>16</sup> = 2<sup>144</sup></code>


# 2 TCP连接 {#tcp-connection}

## 2.1 TCP 建立连接为什么需要 *`3步`* 握手? {#why-tcp-need-3-step-handshake-to-establish-connection}

答：TCP是一个全双工协议，通信双方需要确认`自身`和`对方`都具备`发送`和`接收`数据的能力。而 *`3步`* 握手是确认上述能力的最小交互步数。如下图，`A`和`B`是通信双方：

<table>
  <thead>
    <tr>
      <th rowspan="2">序号</th>
      <th rowspan="2">方向</th>
      <th colspan="4">A确认</th>
      <th colspan="4">B确认</th>
    </tr>
    <tr>
      <td>A发送</td>
      <td>A接收</td>
      <td>B发送</td>
      <td>B接收</td>
      <td>B发送</td>
      <td>B接收</td>
      <td>A发送</td>
      <td>A接收</td>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>
        A -&gt; B
      </td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>✔</td>
      <td>✔</td>
      <td></td>
    </tr>
    <tr>
      <td>2</td>
      <td>
        A &lt;- B
      </td>
      <td>✔</td>
      <td>✔</td>
      <td>✔</td>
      <td>✔</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>3</td>
      <td>
        A -&gt; B
      </td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>✔</td>
      <td>✔</td>
      <td>✔</td>
      <td>✔</td>
    </tr>
  </tbody>
</table>

## 2.2 TCP 关闭连接为什么需要 *`4步`* 挥手? {#why-tcp-need-4-step-handshake-to-close-connection}

答：TCP是一个全双工协议，通信双方需要进行独立的关闭（半关闭：half-clone）。A方发送`FIN`只是代表A不再发送数据了，但是还可以接收B方发送的数据。当B收到A的`FIN`时：B需要给A发送一个ACK；但是TCP并不知道B方是否也需要关闭，而是要由上层应用来决定；故而不能像建立连接时那样合并ACK和自身的`FIN`。


# 3 TCP状态迁移图 {#tcp-state-diagram}

![TCP State Diagram](state-diagram.svg)


# 4 Reference {#reference}

Article : http://www.52im.net/thread-561-1-1.html
