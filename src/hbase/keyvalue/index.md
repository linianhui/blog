---
title: '[HBase] KeyValue'
created_at: 2022-01-16 09:50:00
tag: ["hbase", "KeyValue"]
toc: true
draft: true
---

KeyValue[^keyvalue-source-code]是HBase的最底层的核心存储结构，也是数据最终格式持久化的格式。这里分析一下格式细节。

# 概述 {#overview}

一个KeyValue代表着一行数据中的具体的某一列。比如你的一行数据有10列，那么最终会有10个KeyValue存储下来（没有修改删除的情况下）。此外KeyValue只有添加操作，没有删除修改的操作。基于以上两点，使得HBase具备列一下的特性：

1. SchemaLess : 最小存储单元是列，所以可以不必事先定义好有那些行列结构。
2. 版本管理：只有添加操作，删除和修改是通过新增新版本的KeyValue来处理的。这点和git类似，只增加，不修改。


# 格式 {#format}



待完善。

# 参考 {#reference}

[^keyvalue-source-code]: KeyValue Source Code: <https://github.com/apache/hbase/blob/rel/2.4.9/hbase-common/src/main/java/org/apache/hadoop/hbase/KeyValue.java#L44-L76>