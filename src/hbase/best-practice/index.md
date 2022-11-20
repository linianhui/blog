---
title: '[HBase] Best Practice'
created_at: 2022-09-03 10:01:00
tag: ["hbase", "Best Practice"]
toc: true
displayed_on_home: true
---

# 1 RowKey {#rowkey}

在HBase中，RowKey的设计是否合理很大程度上会严重影响DB的读写性能是否均衡。原因在于HBase的数据分片完全是依赖RowKey的字典序来分割Region的；如果新增部分的数据无法均匀的散列在所有的Region中，就会造成只有部分Region的读写量非常之大，而其余的部分则在旁边打酱油。

推荐采用稳定性Hash算法（比如MD5）作为前缀，比如
```java
String rawRowKey = userId;
String prefix    = md5(userId).hex().subStr(0,4);
String rowKey    = prefix + '_' + rawRowKey;
```
前缀的长度和数据容量有关，比如单Region可以存储10G数据。未来3年内数据量大小在100T左右，那么所需的Region数量为`100T/10G=10240`。4位的hex前缀的范围`0x0000,0xFFFF`, 可以支持65536个Region, 如果是3位则是4096个Region。此时选择4位就可以足够支持未来3年的需要，当然想余留更充足的buffer也可以加到5位（前缀位数越多所需的存储空间也就越大，需要综合考虑，并不能追求过多的位数）。

# 2 预分区和分裂策略 {#pre-split-region}

在设计好RowKey后，建议同时设置预分区和分区策略[^split-policy]。

预分区可以提前使得数据更加均匀的落在RegionServer上，避免自动分裂后的Region和RegionServer的分配不均衡的问题。

分区策略则是可以更好的使得相近的数据落在同一个Region内（以及控制自动分裂的时机），减缓一次数据查询需要跨越多个Region或者RegionServer的问题。比如上面的添加RowKey前缀的方式，就可以结合KeyPrefixRegionSplitPolicy策略，固定长度为4，可以使得同一个用户的数据尽可能都都在一个Region内。


# 3 数据压缩 {#compression}

HBase支持透明的数据压缩。推荐配置的算法为`SNAPPY`[^compression]，在压缩比和资源消耗方面比较均衡。

| Algorithm | % remaining | Encoding | Decoding |
| --------- | ----------- | -------- | -------- |
| GZIP      | 13.4%       | 21 MB/s  | 118 MB/s |
| LZO       | 20.5%       | 135 MB/s | 410 MB/s |
| Snappy    | 22.2%       | 172 MB/s | 409 MB/s |

# 4 透明加密 {#encryption}

HBase支持AES加密，性能损耗大约在13%左右，可以根据需要选择是否开启。

# 5 批量操作 {#batch-ops}

## 5.1 Get {#batch-ops-get}

当需要读取多条数据时，可以选择使用批量的get。

```java
// 设置只读取所需的列簇和列
get.addColumn(family, qualifier);

// 批量读取
Result[] result = table.get(List<Get> gets)
```

## 5.2 Put {#batch-ops-put}

当需要写入多条数据时，可以选择使用批量的put。
```java
// 批量写入
table.put(List<Put> puts)
```

## 5.3 Scan {#batch-ops-scan}

Scan操作可以按需设置缓存。
```java
scan.setCacheBlocks(true);
scan.setCaching(100);
```

# 6 Reference {#reference}

[^split-policy]:[HBase] Region Split Policy : <https://linianhui.github.io/hbase/split-policy>
[^compression]:[HBase] Compression <https://hbase.apache.org/2.3/book.html#compression>
