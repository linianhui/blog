---
title: '[计算机网络编程] Socket'
created_at: 2021-04-13 17:01:23
tag: ["socket"]
toc: true
---

**Socket**[^socket]是一套抽象的用于网络通信的API，它使得应用层可以不必关心底层繁琐的传输通信细节。
> 开始之前最好具备一些**计算机网络**[^computer-networking]的基础，以及**TCP**[^tcp]的相关知识储备。

# 1 基础简介 {#basic}

方便起见，这里假设底层是IPv4和TCP。
## 1.1 地址结构 {#sockaddr_in}

socket连接地址使用`struct sockaddr_in`来存储，主要用来存储连接一方的ip和port。

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

`socket`[^man-socket]。

```c
#include <sys/socket.h>

int socket (int family, int type, int protocol);
```
## 2.2 bind函数 {#bind}

`bind`[^man-bind]。

```c
#include <sys/socket.h>

int bind (int sockfd, const struct sockaddr *myaddr, socklen_t addrlen);
```

## 2.3 listen函数 {#listen}

`listen`[^man-listen]。

```c
#include <sys/socket.h>

int listen (int sockfd, int backlog);
```

## 2.4 connect函数 {#connect}

`connect`[^man-connect]。

```c
#include <sys/socket.h>

int connect(int sockfd, const struct sockaddr *servaddr, socklen_t addrlen);
```

## 2.5 accept函数 {#accept}

`accept`[^man-accept]。

```c
#include <sys/socket.h>

int accept (int sockfd, struct sockaddr *cliaddr, socklen_t *addrlen);
```

## 2.6 send函数 {#send}

`send`[^man-send]。

```c
#include <sys/socket.h>

ssize_t send(int sockfd, const void *buf, size_t len, int flags);
```

## 2.7 recv函数 {#recv}

`recv`[^man-recv]。

```c
#include <sys/socket.h>

ssize_t recv(int sockfd, void *buf, size_t len, int flags);
```

## 2.8 close函数 {#close}

`close`[^man-close]。

```C
#include <unistd.h>

int close (int sockfd);
```

# 3 Eche Example {#echo-example}

一个C语言编写的基于Socket API的Echo程序：<https://github.com/linianhui/networking-programming>

# 4 参考 {#reference}

[^socket]: Network Socket : <https://en.wikipedia.org/wiki/Network_socket>
[^computer-networking]: 计算机网络-系列博客 : <https://linianhui.github.io/computer-networking/>
[^tcp]: TCP : <https://linianhui.github.io/computer-networking/tcp/>
[^man-socket]: `man 3 socket` <https://man7.org/linux/man-pages/man3/socket.3p.html>
[^man-bind]: `man 3 bind` <https://man7.org/linux/man-pages/man3/bind.3p.html>
[^man-listen]: `man 3 listen` <https://man7.org/linux/man-pages/man3/listen.3p.html>
[^man-connect]: `man 3 connect` <https://man7.org/linux/man-pages/man3/connect.3p.html>
[^man-accept]: `man 3 accept` <https://man7.org/linux/man-pages/man3/accept.3p.html>
[^man-send]: `man 3 send` <https://man7.org/linux/man-pages/man3/send.3p.html>
[^man-recv]: `man 3 recv` <https://man7.org/linux/man-pages/man3/recv.3p.html>
[^man-close]: `man 3 close` <https://man7.org/linux/man-pages/man3/close.3p.html>
