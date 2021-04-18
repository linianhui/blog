---
title: '[计算机网络编程] IO Multiplexing'
created_at: 2021-04-13 17:08:23
tag: ["io","multiplexing","networking","programming"]
toc: true
---

在上一节[Socket](../socket/)中介绍了socket相关的一些基础函数，以及一个基础版本的echo客户端和服务器程序，同时也遗留了一些问题[^socket-problem]。

其中核心问题在于只能一次处理一个IO，而且IO的`accept`、`recv`、`send`和`fgets`等操作还都是阻塞的。导致应用大部分时间都是处在等待中，利用效率低下；而fork的多线程版本又性价比不高，支撑不了太多的连接。

那么解决方案呢大致有两类：
1. IO操作异步非阻塞化，称之为异步非阻塞IO。改动较大，而且异步后的通知处理是个麻烦的问题。
2. 同时处理多个同步阻塞的IO，称之为IO Multiplexing（多路复用）。虽然还是阻塞的，但是可以同时处理多个IO，也可以解决问题。

本篇介绍下关于IO Multiplexing（多路复用）这个方案。

# 1 select版本 {#select}

`select`[^select]是最初的IO Multiplexing的方案，它的核心逻辑非常简单直接。告诉kernel多个fd，当有fd可读或者可写时，就返回告知你。这样你调用`accept`、`recv`、`send`和`fgets`等函数时，不就不会阻塞了吗。

它的API就像它的核心逻辑一样简单，就一个核心函数和4和宏函数：
```c
#define FD_SETSIZE 1024

int select(int nfds, 
           fd_set *restrict readfds,
           fd_set *restrict writefds, 
           fd_set *restrict exceptfds,
           struct timeval *restrict timeout);

void FD_CLR(int fd, fd_set *set);
int  FD_ISSET(int fd, fd_set *set);
void FD_SET(int fd, fd_set *set);
void FD_ZERO(fd_set *set);

typedef struct fd_set {
  __int32_t fds_bits[32];
} fd_set;

struct timeval {
    time_t      tv_sec;         /* seconds */
    suseconds_t tv_usec;        /* microseconds */
};
```

# 1.1 使用者角度 {#user-angle}

站在我们使用API的角度来看，`select`提供了一个名为`fd_set`的`struct`来存储我们需要处理的多个`fd`。比如[select-client.c](https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/select-client.c)中的`stdin`和`connect_fd`，以及[select-server.c](https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/select-server.c)中的`accept`的多个`connect_fd`。拿其中一个来举例：

{{<code-snippet lang="c" href="https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/select-server.c#L10-L44">}}
int select_handler(int listen_fd)
{
    bitmap *connect_fd_set = bitmap_init(1024);

    fd_set read_fd_set;

    while (1)
    {
        // 每次都需要重新设置，因为select返回时会重置read_fd_set
        FD_ZERO(&read_fd_set);
        FD_SET(listen_fd, &read_fd_set);
        bitmap_loop(connect_fd_set, FD_SET(i, &read_fd_set));

        // 获取可读的fd，阻塞
        select(connect_fd_set->len, &read_fd_set, NULL, NULL, NULL);

        // 当listen_fd可读时，把获取的连接的fd放入connect_fd_set
        if (FD_ISSET(listen_fd, &read_fd_set))
        {
            bitmap_set(connect_fd_set, accept_e(listen_fd, NULL, NULL));
        }

        // 循环检查connect fd是否可读，可读就用echo处理
        bitmap_loop(
            connect_fd_set,
            if (FD_ISSET(i, &read_fd_set)) {
                if (echo(i) == 0)
                {
                    // 对方断开了连接，那么则移除select，并且关闭连接
                    bitmap_del(connect_fd_set, i);
                    close_e(i);
                }
            });
    }
}
{{</code-snippet>}}

先声明一个`fd_set read_fd_set`，再把`listen_fd`添加进去，紧接着调用`select`。把`fd_set`传递进去，当kernel监测到其中有fd可读时，select就从阻塞中返回了。这时我们循环遍历`read_fd_set`，挨个去处理其中的读取操作即可。需要注意的是：<mark>select每次返回都会清空你先前通过FD_SET添加的fd，所以需要每次select前重新初始化一下fd_set</mark>
> 这时因为fd_set本质上是一个bitmap，它是一个用int或者long表示的数组，通过数组组成一个长度为1024bit的bitmap。fd是个正整数的数字，其索引位置为1就代表包含这个fd。那么当select返回时，其内部就会仅仅可以读或者写的那部分fd设置为1，而其他的全部清除掉。

可以看出它确实是可以支持多个IO了。

## 1.2 遗留问题 {#select-problem}

为什么长度是1024呢？这其实也是它的的处理逻辑导致的：哪怕select只返回了一个fd可读，我们也都需要把所有的fd都检查一遍。当上限再大时，每次循环太多就会导致select的效果下降。
> `bitmap`是笔者自己实现的，因为`fd_set`会被清空，所以需要一个额外的地方存储我们关注的fd集合，然后利用它重新初始化fd_set。

总结：可以处理多个IO了。不足：
1. 1024上限：无法支撑更多的连接。
2. 每次需要重复初始化复制到kernel：来回复制导致浪费性能。
3. 循环检查所有fd：效率低下。

# 2 poll版本 {#poll}

`poll`[^poll]主要解决了select的1和2两个问题，即采用新的数据结构`pollfd`：
1. 突破1024的上限。
2. 通过两个字段`events`和`revents`来区分关注的事件和发生的事件，从而避免重复初始化，

```sh
int poll(struct pollfd *fds, nfds_t nfds, int timeout);

struct pollfd {
    int   fd;         /* file descriptor */
    short events;     /* requested events */
    short revents;    /* returned events */
};
```

这里就不详细介绍来，对细节感兴趣的直接看示例代码：
1. [poll-server.c](https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/poll-server.c)
2. [poll-client.c](https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/poll-client.c)

## 2.2 遗留问题 {#poll-problem}

总结：突破了1024的上限。不足：
1. 虽然避免来重复初始化，但是每次调用依然需要copy整个`pollfd`数组到kernel：来回复制依然导致浪费性能。
2. 还是循环检查所有fd：效率依然低下。

# 3 epoll版本 {#epoll}

`epoll`[^epoll]。

# 4 总结 {#summary}

# 6 参考 {#reference}

[^c10k]: 英文原文: <http://www.kegel.com/c10k.html> 解读系列: <http://www.52im.net/thread-566-1-1.html>
[^select]: Unix `man select` : <https://man7.org/linux/man-pages/man2/select.2.html>
[^poll]: Unix `man poll` : <https://man7.org/linux/man-pages/man2/poll.2.html>
[^epoll]: Linux `man epoll` : <https://man7.org/linux/man-pages/man7/epoll.7.html>
[^kqueue]: BSD `man kqueue` : <https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2>
[^iocp]: IOCP : <https://docs.microsoft.com/en-us/windows/win32/fileio/i-o-completion-ports>
[^fork]: `man fork`: <https://man7.org/linux/man-pages/man2/fork.2.html>
[^io-multiplexing]: IO 模型 : <https://linianhui.github.io/computer-networking/io-model/#io-multiplexing>
[^socket-problem]: Socket 基础版Echo程序遗留问题 : <https://linianhui.github.io/computer-networking-programming/socket/#problem>