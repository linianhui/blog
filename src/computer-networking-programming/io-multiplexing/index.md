---
title: '[计算机网络编程] IO Multiplexing'
created_at: 2021-04-13 17:08:23
tag: ["io","multiplexing","networking","programming"]
toc: true
---

在上一节[Socket](../socket/)中介绍了socket相关的一些基础函数，以及一个基础版本的echo客户端和服务器。这里我们分析下有那些改进空间，以及OS提供的一些改进版函数。
> 源码 ：<https://github.com/linianhui/networking-programming/tree/io-multiplexing/>

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

因为`accept`函数会一直等待连接，并且每次只能返回一个连接，那么为了不阻塞后续的连接，只能简单的用`fork`开开启一个新的线程。

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