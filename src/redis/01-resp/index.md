---
title: '[redis] 01 RESP(REdis Serialization Protocol)'
created_at: 2021-03-19 13:07:23
tag: ["cache", "redis", "resp","telnet"]
toc: true
---

因为Redis是基于网络的分布式缓存服务，所以其隶属于`客户端-服务器架构风格`[^client-server]。这就使得它必须通过网络进行通信，那么其客户端和服务端所采取的`应用层协议`为`RESP(REdis Serialization Protocol)`[^resp]。底层的传输协议为`TCP`[^tcp]，端口号6379。

# 1 请求/响应模型 {#request-response-model}

Client发送各种命令给Server，Server接收命令并处理后把响应消息发回Client。有两种例外的情况：
1. pipelining : Client一次性的发送多个命令。
2. Pub/Sub：Server会改成推送方式，即无需Client发送请求，而是Server主动推送。


# 2 文本协议 {#text-protocal}

`RESP`[^resp]致力于一下三个目标：
1. 易于实现。
2. 快速解析。
3. 人类可读。

> 仅Client-Server之间，Server Cluster Node之间的使用另外的二进制协议进行通信。

RESP是一个文本协议，使用前缀符号标识数据类型以及其长度（同时使用`\r\n`(CRLF)作为结束标识）。

Redis的Request/Response通信方式：
1. Client发送一个[Bull String](#data-type-bull-string)构成的[Array](#data-type-array)的消息。
2. Server回复一个如下数据类型的消息。

## 2.1 数据类型 {#data-type}
### 2.1.1 `+`String {#data-type-string}

语法：`+`data`\r\n`。比如`OK`=`+OK\r\n`。
### 2.1.2 `-`Error {#data-type-error}

语法：`-`data`\r\n`。比如`Error Message`=`-Error message\r\n`。

### 2.1.3 `:`Integer {#data-type-integer}

语法：`:`data`\r\n`。比如`123`=`:123\r\n`。

### 2.1.4 `$`Bull String {#data-type-bull-string}

语法：`$`data-byte-length`\r\n`data`\r\n`。比如：
1. NULLL=`$-1\r\n`。
2. 空字符串=`$0\r\n\r\n`。
3. `abc`=`$3\r\nabc\r\n`。
### 2.1.5 `*`Array {#data-type-array}

语法：`*`array-item-length`\r\n`each-type-data。比如：
1. NULL=`*-1\r\n`。
2. 空数组=`*0\r\n`。
3. `["l",NULL,"nh",56]`=`*4\r\n$1\r\nl\r\n$-1\r\n$2\r\nnh\r\n:56\r\n`。


# 3 Telnet {#telnet}

`Telnet`[^telnet]是一个类似于SSH的协议，默认端口号是23，不过它是明文的协议。直接基于`TCP`[^tcp]协议。故而我们这里直接用它来连接redis-server的6379端口，然后手动构造序列化后的命令发送给server。


```sh
# 连接redis-server
$ telnet 127.0.0.1 6379
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'. # 关闭连接时按crtl+], 然后输入quit，回车即可。
# 输入以下命令["SET","name","lnh"]手工序列化后的内容，使用shift+enter输入换行，enter执行发送。
*3
$3
SET
$4
name
$3
lnh
# 响应
+OK

# 输入
*2
$3
GET
$4
name
# 响应
$3
lnh

# 输入
*2
$4
KEYS
$1
*
# 响应
*1
$4
name
```
可以看出其redis-server可以识别出正确的命令以及响应的正确的数据。

# 4 参考 {#reference}

[^client-server]:<https://linianhui.gitee.io/understand-rest/04-network-based-software-architecture-style/#client-server>
[^resp]:<https://redis.io/topics/protocol>
[^tcp]:<https://linianhui.github.io/computer-networking/tcp/>
[^telnet]:<https://en.wikipedia.org/wiki/Telnet>
