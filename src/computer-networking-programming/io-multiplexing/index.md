---
title: '[计算机网络编程] IO Multiplexing'
created_at: 2021-04-13 17:08:23
tag: ["io","multiplexing","networking","programming","select","poll","epoll","c10k","aio","iocp","kqueue","libuv","libevent"]
toc: true
---

在上一节[Socket](../socket/)中介绍了socket相关的一些基础函数，以及一个基础版本的echo客户端和服务器程序，同时也遗留了一些问题[^socket-problem]。

其中核心问题在于只能一次处理一个IO，而且IO的`accept`、`recv`、`send`和`fgets`等操作还都是阻塞的。导致应用大部分时间都是处在等待中，利用效率低下；而fork[^fork]的多线程版本又性价比不高，支撑不了太多的连接。

那么解决方案主要有两类[^io-model]，这两类都可以解决著名的**C10k问题**[^c10k]：
1. IO操作异步非阻塞化，称之为异步非阻塞IO。改动较大，而且异步后的通知处理是个麻烦的问题。比如**IOCP**[^iocp]。
2. 同时处理多个同步阻塞的IO，称之为IO Multiplexing（多路复用）。虽然还是阻塞的，但是可以同时处理多个IO，也可以解决问题。比如**epoll**[^epoll]和**kqueue**[^kqueue]。

本篇介绍下关于IO Multiplexing（多路复用）这个方案。

# 1 select {#select}

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

## 1.1 使用者角度 {#select-user-angle}

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
> 这时因为fd_set本质上是一个bitmap，它是一个用int或者long表示的数组，通过数组组成一个长度为1024bit的bitmap。fd是个正整数的数字，其索引位置为1就代表包含这个fd。那么当select返回时，其内部就会把可以读或者写的那部分fd设置为1，而其他的全部清除掉。

可以看出它确实是可以支持多个IO了。

## 1.2 遗留问题 {#select-problem}

为什么长度是1024呢？我只能说它就是个约定，API最初就是这么定义的。<mark>需要注意的是，并不是说我们不能处理超过1024个连接，而是说select的一次调用，只能处理1024个。我们完全可以自己定义一个额外的数据结构，每次只copy 1024个给select，处理完后再copy下一个1024个，就像分页一样，只是需要我们自己去处理罢了。</mark>

> `bitmap`是笔者自己实现的，因为`fd_set`会被清空，所以需要一个额外的地方存储我们关注的fd集合，然后利用它重新初始化fd_set。

优点：
1. 可以处理多个IO了。

不足：
1. 每次只能处理1024个：更多的连接需要额外处理。
2. 每次需要重复初始化复制到kernel：来回复制导致浪费性能。
3. 循环检查所有fd：效率低下。

# 2 poll {#poll}

`poll`[^poll]采用新的数据结构`pollfd`：
```c
#include <poll.h>

int poll(struct pollfd *fds, nfds_t nfds, int timeout);

struct pollfd {
    int   fd;         /* file descriptor */
    short events;     /* requested events */
    short revents;    /* returned events */
};
```
## 1.1 使用者角度 {#poll-user-angle}

新的数据结构`pollfd`主要解决了select的1和2两个问题：
1. 突破1024的上限。
2. 通过两个字段`events`和`revents`来区分关注的事件和发生的事件，从而避免重复初始化，

具体使用细节这里就不详细介绍了，感兴趣的看以下的示例代码吧：
1. [poll-server.c](https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/poll-server.c)
2. [poll-client.c](https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/poll-client.c)

## 2.2 遗留问题 {#poll-problem}

优点：
1. 突破了1024的上限。
2. 避免了重复初始化。

不足：
1. 每次调用依然需要copy整个`pollfd`数组到kernel：来回复制依然导致浪费性能。
2. 还是循环检查所有fd：效率依然低下。

# 3 epoll {#epoll}

`epoll`[^epoll]针对poll遗留的问题，给出了新的函数和数据结构。

```c
#include <sys/epoll.h>

#define EPOLL_CTL_ADD 1        /* Add a file descriptor to the interface.  */
#define EPOLL_CTL_DEL 2        /* Remove a file descriptor from the interface.  */
#define EPOLL_CTL_MOD 3        /* Change file descriptor epoll_event structure.  */

int epoll_create(int size);
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);

typedef union epoll_data {
    void    *ptr;
    int      fd;
    uint32_t u32;
    uint64_t u64;
} epoll_data_t;

struct epoll_event {
    uint32_t     events;    /* Epoll events */
    epoll_data_t data;      /* User data variable */
};
```

## 3.1 使用者角度 {#epoll-user-angle}

epoll解决问题的办法：
1. `epoll_create`[^epoll_create]在kernel创建一个`epfd`，用来保存需要处理的fd以及关注的事件类型信息，只初始化一次。
2. `epoll_ctl`[^epoll_ctl]向`epfd`添加、删除或者修改一个fd的event信息，只需处理一次。
3. `epoll_wait`[^epoll_wait]仅返回指定数量的满足要求的event列表。这部分都是可读或者可写的，遍历处理即可。

其中1和2解决来poll遗留的重复来回在kernel和user之间copy数据的问题，交给了kernel内部来维护；3解决了poll中遗留的需要遍历所有数据的问题，仅需遍历就绪的这部分。

具体使用细节在这两个文件中：
1. [epoll-server.c](https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/epoll-server.c)
2. [epoll-client.c](https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/epoll-client.c)

拿`epoll-server`的代码看一下：
{{<code-snippet lang="c" href="https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/epoll-server.c#L11-L76">}}
#include "cnp.h"
#include <sys/epoll.h>

void epoll_ctl_add(int epoll_fd, int fd)
{
    struct epoll_event ev;
    ev.events = EPOLLIN;
    ev.data.fd = fd;
    epoll_ctl(epoll_fd, EPOLL_CTL_ADD, fd, &ev);
}

void epoll_ctl_del(int epoll_fd, int fd)
{
    struct epoll_event ev;
    ev.events = EPOLLIN;
    ev.data.fd = fd;
    epoll_ctl(epoll_fd, EPOLL_CTL_DEL, fd, &ev);
}

void epoll_handler(int listen_fd)
{
    int epoll_fd = epoll_create(1024);
    epoll_ctl_add(epoll_fd, listen_fd);

    int index;
    int fd;
    uint32_t events;

    int event_count = 4;
    struct epoll_event event_array[event_count];

    while (1)
    {
        bzero(event_array, sizeof(event_array));

        // 每次返回指定数量的可读fd
        epoll_wait(epoll_fd, event_array, event_count, -1);
        for (index = 0; index < event_count; index++)
        {
            fd = event_array[index].data.fd;
            if (fd < 0)
            {
                continue;
            }

            events = event_array[index].events;

            // 当listen_fd可读，把获取的连接的fd放入epoll_fd
            if (fd == listen_fd)
            {
                if (events & EPOLLIN)
                {
                    epoll_ctl_add(epoll_fd, accept_e(listen_fd, NULL, NULL));
                }
                continue;
            }

            // 当connect_fd可读时，交由echo处理
            if (events & EPOLLIN)
            {
                if (echo(fd) == 0)
                {
                    epoll_ctl_del(epoll_fd, fd);
                    close_e(fd);
                }
            }
        }
    }
}
{{</code-snippet>}}

## 3.2 遗留问题 {#epoll-problem}

优点：
1. 缓解了kernel和user之间来回copy数据的问题。
2. 仅检查就绪的fd，效率提升了。

不足：
1. 特定于Linux平台。

# 4 总结 {#summary}

1. Linux有epoll[^epoll]。
2. BSD有epoll等效的kqueue[^kqueue]。
3. Windows有NT3.5就加入的`IOCP`[^iocp]，它已经是属于异步IO了。
4. POSIX asynchronous I/O `AIO`[^aio]。 

可见各方都在各显神通来解决**C10k问题**[^c10k]，但是这样的不统一，使用者想跨平台移植就难受了。为此诞生了`libevent`[^libevent]，它为`/dev/poll`、`kqueue`、`POSIX select`、`Windows select`、`poll`和`epoll`。但是对IOCP不支持，Node.js就在此基础上开发了`libuv`[^libuv]，在Windows上增加了IOCP的支持。libevent和libuv均是c语言编写的底层基础库。

当前各种常见到的上层组件的底层也都离不开**同步非阻塞的IO多路复用**[^epoll]，比如Netty、Node.js、Nginx、Redis等等。

# 5 参考 {#reference}

[^c10k]: 英文原文: <http://www.kegel.com/c10k.html> 解读系列: <http://www.52im.net/thread-566-1-1.html>
[^select]: Unix `man select` : <https://man7.org/linux/man-pages/man2/select.2.html>
[^poll]: Unix `man poll` : <https://man7.org/linux/man-pages/man2/poll.2.html>
[^epoll]: Linux `man epoll` : <https://man7.org/linux/man-pages/man7/epoll.7.html>
[^epoll_create]: Linux `man epoll_create` : <https://man7.org/linux/man-pages/man2/epoll_create.2.html>
[^epoll_ctl]: Linux `man epoll_ctl` : <https://man7.org/linux/man-pages/man2/epoll_ctl.2.html>
[^epoll_wait]: Linux `man epoll_wait` : <https://man7.org/linux/man-pages/man2/epoll_wait.2.html>
[^kqueue]: BSD `man kqueue` : <https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2>
[^iocp]: IOCP : <https://docs.microsoft.com/en-us/windows/win32/fileio/i-o-completion-ports>
[^fork]: `man fork`: <https://man7.org/linux/man-pages/man2/fork.2.html>
[^io-model]: IO 模型 : <https://linianhui.github.io/computer-networking/io-model/>
[^socket-problem]: Socket 基础版Echo程序遗留问题 : <https://linianhui.github.io/computer-networking-programming/socket/#problem>
[^aio]: POSIX asynchronous I/O : <https://man7.org/linux/man-pages/man7/aio.7.html>
[^libevent]: libevent : <https://github.com/libevent/libevent>
[^libuv]: libuv : <https://github.com/libuv/libuv>