---
title: '[计算机网络编程] IO Multiplexing'
created_at: 2021-04-13 17:08:23
tag: ["io","multiplexing","networking","programming"]
toc: true
---

在上一节[Socket](../socket/)中介绍了socket相关的一些基础函数，以及一个基础版本的echo客户端和服务器。这里我们分析下有那些改进空间，以及OS提供的一些改进版函数。
> 源码 ：<https://github.com/linianhui/networking-programming/tree/io-multiplexing/>。源码中对socket原生函数添加了包装，比如命名方式为`xxx_e`，函数签名完全保持一致，不同之处在于包装函数内部增加了`log`和`error`记录处理。

# 1 基础版本 {#basic}

基础版本中采用`fork`[^fork]来提供处理多个连接的能力。
{{<code-snippet lang="c" href="https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/socket-server.c#L20-L34">}}
void fork_handler(int listen_fd){
    int connect_fd;

    while (1)
    {
        // 获取已建立的连接，阻塞。
        connect_fd = accept_e(listen_fd, NULL, NULL);
        if (fork() == 0)
        {
            echo(connect_fd);
            exit(0);
        }
        close_e(connect_fd);
    }
}
{{</code-snippet>}}

因为`accept`函数会一直等待连接，并且每次只能返回一个连接，那么为了不阻塞后续的连接，只能简单的用`fork`开启一个新的线程去处理`connect_fd`的读写，然后主进程继续阻塞在`accept`函数等待新的连接。

新线程处理echo函数。
{{<code-snippet lang="c" href="https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/socket-server.c#L3-L18">}}
void echo(int connect_fd)
{
    char buf[BUFFER_SIZE];
    int recv_size;

    while (1)
    {
        bzero(buf, sizeof(buf));
        // 读取接收的数据，阻塞
        recv_size = socket_revc_and_send(connect_fd, buf);
        if (recv_size == 0)
        {
            break;
        }
    }
}
{{</code-snippet>}}

当没有数据可读时，依然会阻塞在`revc`函数处。
{{<code-snippet lang="c" href="https://github.com/linianhui/networking-programming/blob/io-multiplexing/src/cnp.c#L287-L304">}}
int socket_revc_and_send(int connect_fd, char *buf)
{
    // 没有数据可读时一致阻塞在此处。
    int recv_size = recv_e(connect_fd, buf, sizeof(buf), 0);
    // 返回0表示对方发送了FIN要求关闭连接，故而退出这个方法。
    if (recv_size == 0)
    {
        close_e(connect_fd);
        return 0;
    }

    for (size_t i = 0; i < recv_size; i++)
    {
        buf[i] = toupper(buf[i]);
    }

    send_e(connect_fd, buf, recv_size + 1, 0);

    return recv_size;
}
{{</code-snippet>}}

## 1.1 遗留问题 {#basic-problem}

1. `fork`上线有限，而且成本高昂，OS无法承担成千上万个线程。
2. `accept`是个阻塞函数，并且只能返回一个连接。
3. `recv`也是个阻塞函数，依然会阻塞整个线程。

那么针对上述问题，OS逐步诞生了一些称之为<mark>IO多路复用（IO Multiplexing）</mark>的技术。用来改善上述遗留的问题。

# 2 select版本 {#select}

`select`[^select]。

# 3 poll版本 {#poll}

`poll`[^poll]。

# 4 epoll版本 {#epoll}

`epoll`[^epoll]。

# 5 总结 {#summary}

# 6 参考 {#reference}

[^c10k]: 英文原文: <http://www.kegel.com/c10k.html> 解读系列: <http://www.52im.net/thread-566-1-1.html>
[^select]: Unix `man select` : <https://man7.org/linux/man-pages/man2/select.2.html>
[^poll]: Unix `man poll` : <https://man7.org/linux/man-pages/man2/poll.2.html>
[^epoll]: Linux `man epoll` : <https://man7.org/linux/man-pages/man7/epoll.7.html>
[^kqueue]: BSD `man kqueue` : <https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2>
[^iocp]: IOCP : <https://docs.microsoft.com/en-us/windows/win32/fileio/i-o-completion-ports>
[^fork]: `man fork`: <https://man7.org/linux/man-pages/man2/fork.2.html>