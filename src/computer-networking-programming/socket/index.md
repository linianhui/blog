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
typedef __uint32_t in_addr_t；     /* base type for internet address */
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


待补充...

# 3 Eche Example {#echo-example}

一个C语言编写的基于Socket API的Echo程序：<https://github.com/linianhui/networking-programming>

# 4 参考 {#reference}

[^socket]: Network Socket : <https://en.wikipedia.org/wiki/Network_socket>
[^computer-networking]: 计算机网络-系列博客 : <https://linianhui.github.io/computer-networking/>
[^tcp]: TCP : <https://linianhui.github.io/computer-networking/tcp/>
