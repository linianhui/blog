---
title: "[计算机网络] 02 [Layer] Data Link"
created_at: 2019-09-22 08:12:00
tag: ["封装成帧","透明传输","差错检测","Frame","MTU","SOH","EOT","ESC","MAC"]
toc: true
---

# 1 链路层的用途 {#data-link-purpose}

上一篇中说到物理层的用途是为上层提供`01`bit流，这个上层指的就是链路层。结合开篇中提到的计算机网络的核心设计理念**分组交换**，这一层的用途就是提供分组后的数据帧(`PDU=Frame`)。

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

## 2.2 透明传输 {#transparent-transmission}

有了`SOH`和`EOT`还是远远不够的，设想一下当你要传输的数据中正好也包含这两个标记，那么我们的起始和结束岂不就错乱了？对的，正是如此，所以就需要找一个办法来识别出这种数据。这个办法就是转义，即通过添加一个新的符号来改变`SOH`和`EOT`的含义。

- 转义符号 : `ESC(Escape)`，二进制`0001_1011`。

![透明传输](transparent-transmission.svg)

## 2.3 差错检测 {#error-detection}

终于可以完成的对下层的`01`进行分组了。但是在传输过程中可能会发生差错，比如把`0`处理成了`1`，或者过来，再或者丢了一些数据，为了保证其完整性，就需要对其进行差错检测。广泛使用的方式是`CRC(Cyclic Redundancy Check)`。

![差错检测](error-detection.svg)


# 3 帧 {#freame}

未完待续...

# 5 总结 {#summary} 

