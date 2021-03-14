---
title: "[计算机网络] IO 模型"
created_at: 2020-02-20 21:40:00
toc: true
---

# 0 IO 模型 {#io-model}

在I/O模型中，设想如此场景 : **`application`通过`kernel`的`read`函数读取数据，但是`kernel`还未准备好数据**。那么此时`read`函数有两种处理方式（大致的流程）：

{{<inline-html path="io-model.html">}}

![I/O Model](io-model.gif)

# 1 Blocking I/O {#blocking-io}

![Blocking I/O](blocking.gif)

对应上述表格中的1。这种方式模型简单，`Blocking`时`application`的进程/线程被挂起，基本不会占用`CPU`资源。但是当并发大时就需要创建N个进程/线程，造成内存、线程切换开销增大。

# 2 Non-Blocking I/O {#non-blocking-io}

![Non-Blocking I/O](non-blocking.gif)

对应上述表格中的2.1。这种方式明显看起来和`Blocking`没什么区别，不停的调用会造成CPU负担过重。

# 3 I/O Multiplexing (select, poll, epoll) {#io-multiplexing}

![I/O Multiplexing (select)](io-multiplexing-select.gif)

对应上述表格中的2.1。但是会同时通过(select, poll, epoll)在一个进程/线程中`Blocking`多个连接（故而称为`I/O多路复用`），当其中有一个连接的有数据可读时就返回。但是实质上还是`Blocking`的，只是不会`Blocking`到`read`环节，而是(select, poll, epoll)环节。因为不会为每个连接创建对应的进程/线程，故而性能较好。

# 4 Signal Driven I/O (SIGIO) {#signal-driven-io}
对应上述表格中的2.2.1。

# 5 Asynchronous I/O (POSIX aio, Windows iocp) {#asynchronous-io}

![Asynchronous Non-Blocking I/O (aio)](asynchronous-non-blocking-aio.gif)

对应上述表格中的2.2.2。当`application`接收到回调通知时，数据已经复制给`application`，故而性能最佳。

# 6 Reference {#reference}

The C10K Problem
> http://www.kegel.com/c10k.html  
> http://www.52im.net/thread-566-1-1.html

Select
> https://en.wikipedia.org/wiki/Select_(Unix)

Epoll
> https://en.wikipedia.org/wiki/Epoll

AIO(Asynchronous Input/Output)
> https://en.wikipedia.org/wiki/Asynchronous_I/O

IOCP(Input/Output Completion Port)
> https://en.wikipedia.org/wiki/Windows_NT_3.5  
> https://en.wikipedia.org/wiki/Input/output_completion_port  
> https://docs.microsoft.com/zh-cn/windows/win32/fileio/i-o-completion-ports

I/O Model Article
> http://www.52im.net/thread-1935-1-1.html  
> https://developer.ibm.com/articles/l-async/
