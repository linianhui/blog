---
title: "[计算机网络] 02 [Layer] Data Link"
created_at: 2019-09-22 08:12:00
tag: ["封装成帧","透明传输","差错检测","Frame","MTU","SOH","EOT","ESC","CRC","FCS","MAC"]
toc: true
---

# 1 链路层的用途 {#data-link-purpose}

上一篇的遗留问题说到物理层仅仅提供`01`bit流是远远不够的，需要进行更高层的抽象。结合开篇中提到的计算机网络的核心设计理念**分组&交换**，这一层的用途就是分组 : 提供基于`01`bit流分组后的数据帧(`PDU=Frame`)。

![](bit-frame.png)

# 2 三个基本问题 {#three-basic-question}

想要从下层的`01`比特中抽象出这样的结果，则需要解决一下的三个基本问题：

1. 封装成帧。
2. 透明传输。
3. 差错检测。

## 2.1 封装成帧 {#encapsulation-into-frame}

下层物理层提供的是`01`bit流，想要变成分组后的帧，就需要定义起始和结束的标记。

1. 起始标识 : `SOH(Start Of Headine)`，二进制`0000_0001`。
2. 结束标识 : `EOT(End Of Transmission)`，二进制`0000_0100`。

![封装成帧](encapsulation-into-frame.svg)

发送方会在Frame前后插入`SOH`和`EOT`。接受方会读取这2个标记中间的数据。每一个链路层协议对`Frame`的长度都有约束，称为`MTU(Maximum Transfer Unit)`.

## 2.2 透明传输 {#transparent-transmission}

有了`SOH`和`EOT`还是远远不够的，设想一下当你要传输的数据中正好也包含这两个标记，那么我们的起始和结束岂不就错乱了？对的，正是如此，所以就需要找一个办法来识别出这种数据。这个办法就是转义，即通过添加一个新的符号来改变`SOH`和`EOT`的含义。

- 转义符号 : `ESC(Escape)`，二进制`0001_1011`。

![透明传输](transparent-transmission.svg)

发送方会检查Frame，然后在需要转义的地方加入`ESC`。接受方读取`Frame`时会检查是否同时出现了`ESC SOH`、`ESC ESC`和`ESC EOT`,有的话就移除`ESC`，然后把后续的一个`Octet`当作正常的数据。

## 2.3 差错检测 {#error-detection}

终于可以完成的对下层的`01`进行分组了。但是在传输过程中可能会发生差错，比如把`0`处理成了`1`，或者过来，再或者丢了一些数据，为了保证其完整性，就需要对其进行差错检测。这时就需要把一些校验码放在`Frame`的后面(`EOT`的前面)，这种方式称为帧检测序列`FCS(Frame Check Sequence)`。生成校验码的方式通常是是`CRC(Cyclic Redundancy Check)`，具体的算法就不展开了。

![差错检测](error-detection.svg)

如果接受方接收到数据后检测发现校验码对不上，则会丢弃这个`Frame`。从这个差错检测也可以反向推断出来，如果不分组成`Frame`，则就无法进行差错检测了。

# 3 Frame {#freame}

未完待续...

# 4 设备 {#device}

## 4.1 交换机 {#switch}

# 5 总结 {#summary}

链路层关注的是分组 : 把物理层的`01`bit流分组成`Frame`，以及对`Frame`的差错检测。完成了`分组&交换`的第一步`分组`。

# 6 遗留问题 {#leftover-problem}

但是如果传输过程中`Frame`丢失了、重复了或者乱序了等等，链路层对这种错误则是无能为力的，所以链路层并不能对上层提供**可靠传输(发送方按序发送，接收方按序接收)**。这些问题就留给了更高层的协议来完成了。
