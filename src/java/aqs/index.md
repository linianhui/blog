---
title: '[Java] AQS(AbstractQueuedSynchronizer)'
created_at: 2020-11-08 19:33:01
tag: ["Java", "AQS","CAS","lock"]
toc: true
---

在Java中，除了JVM级别支持的[synchronized](../synchronized/)锁之外，还有一种锁，其顶层接口是`java.util.concurrent.locks.Lock`[^lock]。

与JVM支持的[synchronized](../synchronized/)不同的是，`Lock`这种锁是由基础库支持的（Jdk1.5引入）。



# 参考资料

[^lock]: `java.util.concurrent.locks.Lock` 接口：<https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/locks/Lock.html>

