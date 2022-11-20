---
title: "[计算机网络] IO 模型"
created_at: 2020-02-20 21:40:00
toc: true
displayed_on_home: true
---

# 1 基本概念 {#concept}

在开始前先解释两组概念。

## 1.1 Blocking / Non-Blocking {#blocking}

Blocking和Non-Blocking通常指的这次操作会不会阻碍后续操作。比如在等红绿灯，或者遇上了堵车，我们通常都会说是被堵了，导致你只能在此等着，虽然你闲下来了，但是干不了后续其他事情。

## 1.2 Synchronous / Asynchronous {#synchronous}

Synchronous和Asynchronous通常指的是这次操作能不能立即得到想要的结果。如果可以，那就是Synchronous，否则就是Asynchronous。比如你去打印店打印文件，你去了之后把东西给到店主，说：“打印好告诉我，我先去忙其他的了”，这就是异步。

通常情况下就可以自由组合：
1. Synchronous Blocking。
2. Synchronous Non-Blocking。
3. Asynchronous Non-Blocking。

# 2 IO 模型 {#io-model}

在I/O模型中，设想如此场景 : **`application`通过`kernel`的`read`函数读取数据，但是`kernel`还未准备好数据**。那么此时`read`函数有两种处理方式（大致的流程）：

{{<inline-html path="io-model.html">}}

![I/O Model](io-model.gif)

## 2.1 Blocking I/O {#blocking-io}

![Blocking I/O](blocking.gif)

对应上述表格中的1。这种方式模型简单，`Blocking`时`application`的进程/线程被挂起，基本不会占用`CPU`资源。但是当并发大时就需要创建N个进程/线程，造成内存、线程切换开销增大。

## 2.2 Non-Blocking I/O {#non-blocking-io}

![Non-Blocking I/O](non-blocking.gif)

对应上述表格中的2.1。这种方式明显看起来和`Blocking`没什么区别，不停的调用会造成CPU负担过重。

## 2.3 I/O Multiplexing (select, poll, epoll) {#io-multiplexing}

![I/O Multiplexing (select)](io-multiplexing-select.gif)

对应上述表格中的2.1。但是会同时通过(select, poll, epoll)在一个进程/线程中`Blocking`多个连接（故而称为`I/O多路复用`），当其中有一个连接的有数据可读时就返回。但是实质上还是`Blocking`的，只是不会`Blocking`到`read`环节，而是(select, poll, epoll)环节。因为不会为每个连接创建对应的进程/线程，故而性能较好。

## 2.4 Signal Driven I/O (SIGIO) {#signal-driven-io}
对应上述表格中的2.2.1。

## 2.5 Asynchronous I/O (POSIX aio, Windows iocp) {#asynchronous-io}

![Asynchronous Non-Blocking I/O (aio)](asynchronous-non-blocking-aio.gif)

对应上述表格中的2.2.2。当`application`接收到回调通知时，数据已经复制给`application`，故而性能最佳。

# 3 Reference {#reference}

The C10K Problem
1. http://www.kegel.com/c10k.html  
2. http://www.52im.net/thread-566-1-1.html

Select
1. https://en.wikipedia.org/wiki/Select_(Unix)

Epoll
1. https://en.wikipedia.org/wiki/Epoll

AIO(Asynchronous Input/Output)
1. https://en.wikipedia.org/wiki/Asynchronous_I/O

IOCP(Input/Output Completion Port)
1. https://en.wikipedia.org/wiki/Windows_NT_3.5  
2. https://en.wikipedia.org/wiki/Input/output_completion_port  
3. https://docs.microsoft.com/zh-cn/windows/win32/fileio/i-o-completion-ports

I/O Model Article
1. http://www.52im.net/thread-1935-1-1.html  
2. https://developer.ibm.com/articles/l-async/
