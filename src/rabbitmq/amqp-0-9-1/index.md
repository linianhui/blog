---
title: '[rabbitmq] amqp 0-9-1'
created_at: 2021-04-09 14:10:12
tag: ["mq", "rabbitmq", "amqp"]
toc: true
---

`AMQP(Advanced Message Queuing Protocol)`[^amqp]是一个应用层的消息队列协议。目前主要有2个版本，`0-9-1`[^amqp-0-9-1]和`1.0`[^amqp-1.0]。虽然看起来差别不大，其实两个协议差异巨大。`0-9-1`协议包含了一个完整的MQ所需的基本组件的约束，而`1.0`则仅仅聚焦在消息本身。rabbitmq实现了`0-9-1`，绝大多数的client也是支持`0-9-1`；而`1.0`目前则是以插件的形式提供支持，client端支持情况一般。故而这里专注介绍`0-9-1`版本。


待完善。

# 参考 {#reference}

[^amqp]:<https://www.amqp.org>
[^amqp-0-9-1]:发布于2008年：<https://www.amqp.org/specification/0-9-1/amqp-org-download>
[^amqp-1.0]:发布于2011年：<https://www.amqp.org/specification/1.0/amqp-org-download>