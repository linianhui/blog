---
title: '[计算机网络编程] Socket'
created_at: 2021-04-13 17:01:23
tag: ["socket"]
toc: true
---

**Socket**[^socket]是一套抽象的用于网络通信的API，它使得应用层可以不必关心底层繁琐的传输通信细节。
> 开始之前最好具备一些**计算机网络**[^computer-networking]的基础，**TCP**[^tcp]以及**网络字节序**[^endian]的相关知识储备。

# 1 基础简介 {#basic}

方便起见，这里假设底层是IPv4和TCP。
## 1.1 地址结构 {#sockaddr_in}

既然是建立通信，那么就需要知道对方的地址。socket使用`struct sockaddr_in`来存储连接一方的`ip`和`port`。

```c
typedef __uint32_t in_addr_t;     /* base type for internet address */
typedef __uint8_t  sa_family_t; 

struct in_addr {
    in_addr_t s_addr;              /* 32 bit Internet address */
};

/* IPv4专属的 */
struct sockaddr_in {
    __uint8_t       sin_len;       /* struct length */
    sa_family_t     sin_family;    /* address family */
    in_port_t       sin_port;      /* 16bit port number */
    struct in_addr  sin_addr;      /* 32bit IPv4 */
    char            sin_zero[8];   /* unused */
};

/* 通用的 */
struct sockaddr {
    __uint8_t       sa_len;         /* struct length */
    sa_family_t     sa_family;      /* address family */
    char            sa_data[14];    /* sin_port sin_addr sin_zero[8] */
};
```



# 2 函数 {#function}

## 2.1 socket函数 {#socket}

`socket`[^man-socket]用于创建一个用于通信的endpoint。使用方 **client** 和 **server**。

```c
#include <sys/socket.h>

int socket(int domain, int type, int protocol);
```

参数：
1. `int domain`：通信领域。比如`AF_UNIX`、`AF_INET`和`AF_INET6`分别代表unix本地通信、IPv4和IPv6。
2. `int type`：通信类型。比如`SOCK_STREAM`和`SOCK_DGRAM`分别代表向上层提供stream和datagram形式的数据。
3. `int protocol`：应用层协议类型。比如`IPPROTO_TCP`和`IPPROTO_UDP`。

返回值：
1. 成功：文件描述fd。
2. 失败：`-1`。`errno`[^man-errno]代表具体的错误类型。

示例：
```c
int listen_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
if (listen_fd == -1){
  // check errno
}
```

## 2.2 bind函数 {#bind}

`bind`[^man-bind]一个地址到sockfd上。使用方仅**server**。

```c
#include <sys/socket.h>

int bind (int sockfd, const struct sockaddr *myaddr, socklen_t addrlen);
```

参数：
1. `int sockfd`：已创建的sockfd。
2. `const struct sockaddr *myaddr`：绑定的地址。
3. `socklen_t addrlen`：地址struct的长度，用于指导bind函数内部应该在`myaddr`指针上读取多少数据作为地址。

返回值：
1. 成功：`0`。
2. 失败：`-1`。`errno`[^man-errno]代表具体的错误类型。

示例：
```c
struct sockaddr_in server_address;

bzero(&server_address, sizeof(server_address));
server_address.sin_family = AF_INET;
server_address.sin_addr.s_addr = htons(INADDR_ANY);
server_address.sin_port = htons(LISTEN_PORT);

int bind_result = bind(listen_fd, (struct sockaddr *)&server_address, sizeof(server_address);
if (bind_result == -1){
  // check errno
}
```

## 2.3 listen函数 {#listen}

`listen`[^man-listen]开始监听连接。使用方仅**server**。

```c
#include <sys/socket.h>

int listen (int sockfd, int backlog);
```

参数：
1. `int sockfd`：已bind的sockfd。
2. `int backlog`：最大的队列长度。如果连接数超过了最大队列长度，那么新的连接就会收到一个`ECONNREFUSED`错误。

返回值：
1. 成功：`0`。
2. 失败：`-1`。`errno`[^man-errno]代表具体的错误类型。

示例：
```c
int listen_result = listen(listen_fd, 10);
if (listen_result == -1){
  // check errno
}
```

## 2.4 connect函数 {#connect}

`connect`[^man-connect]一个处于listen状态的**server**。使用方仅**client**。一直阻塞到建立连接后才返回。

```c
#include <sys/socket.h>

int connect(int sockfd, const struct sockaddr *servaddr, socklen_t addrlen);
```

参数：
1. `int sockfd`：**client**创建的sockfd。
2. `const struct sockaddr *servaddr`：**server**的地址。
3. `socklen_t addrlen`：地址struct的长度，用于指导connect函数内部应该在`servaddr`指针上读取多少数据作为地址。

返回值：
1. 成功：`0`。
2. 失败：`-1`。`errno`[^man-errno]代表具体的错误类型。

示例：
```c
struct sockaddr_in server_address;

bzero(&server_address, sizeof server_address);
server_address.sin_family = AF_INET;
server_address.sin_port = htons(SERVER_PORT);
inet_pton(AF_INET, "127.0.0.1", &(server_address.sin_addr));

int connect_result = connect(client_sockfd, (struct sockaddr *)&server_address, sizeof(server_address));
if (connect_result == -1){
  // check errno
}
```

## 2.5 accept函数 {#accept}

`accept`[^man-accept]获取一个已经建立的连接。使用方仅**server**。一直阻塞到获取到一个连接后才返回。

```c
#include <sys/socket.h>

int accept (int sockfd, struct sockaddr *cliaddr, socklen_t *addrlen);
```

参数：
1. `int sockfd`：上面listen后的sockfd。
2. `struct sockaddr *cliaddr`：建立连接的**client**的地址。
3. `socklen_t *addrlen`：地址struct的长度，用于指导accept函数内部应该在`cliaddr`指针上写入多少数据。

返回值：
1. 成功：当着这个连接的文件描述符fd。
2. 失败：`-1`。`errno`[^man-errno]代表具体的错误类型。

示例：
```c
struct sockaddr_in client_address;
socklen_t client_length = sizeof(client_address);

int connect_fd = accept(listen_fd, (struct sockaddr *)&client_address, &client_length);
if (connect_fd == -1){
  // check errno
}
```

## 2.6 send函数 {#send}

`send`[^man-send]发送数据到内核的发送缓冲区。使用方 **client** 和 **server**。

```c
#include <sys/socket.h>

ssize_t send(int sockfd, const void *buf, size_t len, int flags);
```

参数：
1. `int sockfd`：上面connect后的或者accept后的sockfd。
2. `const void *buf`：准备发送的数据的指针。
3. `size_t len`：准备发送的数据的最大长度。
4. `int flags`：。

返回值：
1. 成功：发送成功的数据长度，可能会小于`size_t len`参数。
2. 失败：`-1`。`errno`[^man-errno]代表具体的错误类型。

示例：
```c
//
```

## 2.7 recv函数 {#recv}

`recv`[^man-recv]从内核的接收缓冲区中读取数据。使用方 **client** 和 **server**。

```c
#include <sys/socket.h>

ssize_t recv(int sockfd, void *buf, size_t len, int flags);
```

参数：
1. `int sockfd`：上面connect后的或者accept后的sockfd。
2. `const void *buf`：准备接收数据的buf指针。
3. `size_t len`：准备接收的数据的最大长度。
4. `int flags`：。

返回值：
1. 成功：接收成功的数据长度，可能会小于`size_t len`参数。
2. 失败：`-1`。`errno`[^man-errno]代表具体的错误类型。

示例：
```c
//
```

## 2.8 close函数 {#close}

`close`[^man-close]关闭连接。使用方 **client** 和 **server**。

```C
#include <unistd.h>

int close (int fd);
```

参数：
1. `int fd`：待关闭的fd。

返回值：
1. 成功：`0`。
2. 失败：`-1`。`errno`[^man-errno]代表具体的错误类型。

示例：
```c
int close_result = close(connect_fd);
if (close_result == -1){
  // check errno
}
```

# 3 Eche Example {#echo-example}

一个C语言编写的基于Socket API的Echo程序：<https://github.com/linianhui/networking-programming>

# 4 参考 {#reference}

[^socket]: Network Socket : <https://en.wikipedia.org/wiki/Network_socket>
[^computer-networking]: 计算机网络-系列博客 : <https://linianhui.github.io/computer-networking/>
[^tcp]: TCP : <https://linianhui.github.io/computer-networking/tcp/>
[^endian]: 网络字节序 : <https://linianhui.github.io/computer-networking/00-overview/#endian>
[^man-socket]: `man 2 socket` <https://man7.org/linux/man-pages/man2/socket.2.html>
[^man-bind]: `man 2 bind` <https://man7.org/linux/man-pages/man2/bind.2.html>
[^man-listen]: `man 2 listen` <https://man7.org/linux/man-pages/man2/listen.2.html>
[^man-connect]: `man 2 connect` <https://man7.org/linux/man-pages/man2/connect.2.html>
[^man-accept]: `man 2 accept` <https://man7.org/linux/man-pages/man2/accept.2.html>
[^man-send]: `man 2 send` <https://man7.org/linux/man-pages/man2/send.2.html>
[^man-recv]: `man 2 recv` <https://man7.org/linux/man-pages/man2/recv.2.html>
[^man-close]: `man 2 close` <https://man7.org/linux/man-pages/man2/close.2.html>
[^man-errno]: `man 2 errno` <https://man7.org/linux/man-pages/man3/errno.3.html>
