---
title: '[HBase] Connection Pool'
created_at: 2022-01-22 13:15:00
tag: ["db","HBase","连接池"]
toc: true
draft: true
---


# AbstractRpcClient 

1. callBlockingMethod
2. callMethod
3. [getConnection](https://github.com/apache/hbase/blob/rel/2.4.9/hbase-client/src/main/java/org/apache/hadoop/hbase/ipc/AbstractRpcClient.java#L343-L361)
4. synchronized PoolMap<ConnectionId, T> connections
5. PoolMap<K, V>#getOrCreate
6. Pool#getOrCreate
7. [RoundRobinPool#getOrCreate](https://github.com/apache/hbase/blob/rel/2.4.9/hbase-client/src/main/java/org/apache/hadoop/hbase/util/PoolMap.java#L217-L233)
7. ThreadLocalPool#getOrCreate

```java
class HConstants {
  public static final String HBASE_CLIENT_IPC_POOL_TYPE = "hbase.client.ipc.pool.type";
  public static final String HBASE_CLIENT_IPC_POOL_SIZE = "hbase.client.ipc.pool.size";
}
```

# RoundRobinPool

# ThreadLocalPool

待完善。
