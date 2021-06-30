---
title: '[Redis]'
---

基于网络的分布式K/V存储服务组件。具备一下特点：
1. 数据位于内存中：读写速度非常快。
2. 单线程模型：server和client实现简单稳定可靠。
3. 丰富的数据类型：支持不同的业务环境需求。
4. 存储之外的其他功能支持：pub/sub、lua script、piplining、transaction。
5. 支持持久化。
6. 支持高可用的集群部署以及水平扩展。

参考资料：
1. <https://redis.io/>
2. <https://github.com/redis/redis>