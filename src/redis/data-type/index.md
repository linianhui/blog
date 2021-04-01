---
title: '[redis] data type'
created_at: 2021-03-19 19:50:23
tag: ["cache", "redis", "string","list","set","sorted set","hash","module","stream","bitmap","hyperloglog","sds","dev"]
toc: true
---

redis支持丰富的数据类型[^data-type]。大致可以分为两大类：
1. 基本数据类型：redis底层定义支持的基本类型。
2. 高级数据类型：基于基本类型组合而成的高级数据类型。

# 1 基本数据类型 {#basic}

redis源码中定义了7中基本类型[^data-type]。

{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/server.h#L499-L521">}}
#define OBJ_STRING 0    /* String object. */
#define OBJ_LIST 1      /* List object. */
#define OBJ_SET 2       /* Set object. */
#define OBJ_ZSET 3      /* Sorted set object. */
#define OBJ_HASH 4      /* Hash object. */
#define OBJ_MODULE 5    /* Module object. */
#define OBJ_STREAM 6    /* Stream object. */
{{</code-snippet>}}

其中最常见和用到的有6种：[string](#string),[list](#list),[set](#set),[zset](#zset),[hash](#hash),[stream](#stream)。`module`是server内部使用的，站在client的角度不可见，我们这里也就不关心它了。

## 1.1 String {#string}

string是一个**二进制安全的**字符串，类似于java的String，但是它是可以修改的。value最大长度不能超过**512MB**。

redis中的key是string类型的，key的命名规则的通常采用`:`分割的具有层级结构的形式，比如`account:1001:followers`。

常用命令：
1. `SET key value`：O(1)。设置一个。
2. `MSET key value [key value ...]`：O(N)，N=key/value数量。批量设置多个。
3. `GET key`：O(1)。获取一个。
4. `MGET key [key ...]`：O(N)，N=key数量。批量获取多个。
5. `DEL key [key ...]`：O(N)，N=key数量。批量删除多个。
6. `STRLEN key`：O(1)。获取长度。
7. `GETDEL key`：O(1)。获取并且删除。

底层实现：
1. [SDS](#sds)

## 1.2 List {#list}

list是一个有序的string元素序列，它类似于java中的LinkedList。最大元素数量是<code>2<sup>32</sup>-1=4294967295(40亿+)</code>。

常用命令：
1. `LPUSH key element [element ...]`：O(N)，N=element数量。在左侧添加一个或多个。
2. `RPUSH key element [element ...]`：O(N)，N=element数量。在右侧添加一个或多个。
3. `LPOP key [count]`：O(N)，N=count。在左侧返回一个或多个并删除。
4. `RPOP key [count]`：O(N)，N=count。在右侧返回一个或多个并删除。
5. `LLEN key`：O(1)。获取长度。
6. `LRANGE key start_index stop_index`：O(N)。返回指定的范围的元素序列，索引从0开始，负数表示从最后一个元素倒数，比如-1是最后一个元素，-2是倒数第二个元素。

底层实现：
1. [QuickList](#quicklist)
2. [LinkedList](#linkedlist)
3. [ZipList](#ziplist)

## 1.3 Set {#set}

set是一个无序string元素的集合，但是其中的元素的具有唯一性，因此可以判断元素是否存在，取交集、并集和差集这样的操作。最大元素数量是<code>2<sup>32</sup>-1=4294967295(40亿+)</code>。

常用命令：
1. `SADD key member [member ...]`: O(N)，N=memner数量。添加元素。
2. `SISMEMBER key member`: O(1)。判断元素是否存在。
3. `SMISMEMBER key member [member ...]`: O(N)，N=memner数量。判断多个元素是否分别存在。
4. `SMEMBERS key`: O(N)，N=memner数量。返回所有元素。
5. `SREM key member [member ...]`: O(N)，N=memner数量。移除指定的元素。
6. `SRANDMEMBER key [count]`: O(N)，N=count。随机返回count个元素。
7. `SPOP key [count]`: O(N)，N=count。随机移除并返回count个元素。
8. `SCARD key`: O(1)。返回元素的个数（基数）。
9. `SDIFF key [key ...]`: O(N)，N=所有key的元素数之和。差集。返回第一个key中不存在于后续key中的元素集合。
10. `SDIFFSTORE destination key [key ...]`: 同SDIFF，区别在于把结果存储到另外一个指定的key。
11. `SINTER key [key ...]`: O(N*M)，N=key的数量，M=元素数。交集。
12. `SUNION key [key ...]`: O(N)，N=key的数量，M=元素数。并集。

底层实现：
1. [IntSet](#intset)
2. [Dict](#dict)

## 1.4 ZSet {#zset}

类似set，不同之处它是有序的。

底层实现：
1. [ZipList](#ziplist)
2. [SkipList](#skiplist)

## 1.5 Hash {#hash}

hash是一个K/V集合（K/V都是string），类似于java中的HashMap。最大元素数量是<code>2<sup>32</sup>-1=4294967295(40亿+)</code>。

常用命令：
1. `HSET key field value [field value ...]`：O(N)，N=field/value数量。设置一个或多个。
2. `HGET key field`：O(1)。获取用一个。
3. `HMGET key field [field ...]`：O(N)，N=field数量。获取一个或多个。
4. `HLEN key`：O(1)。获取长度。
5. `HEXISTS key field`：O(1)。检查field是否存在。
6. `HKEYS key`：O(N)，实际元素数量。获取所有key。
7. `HVALS key`：O(N)，实际元素数量。获取所有value。
8. `HGETALL key`：O(N)，实际元素数量。获取所有key/value。

底层实现：
1. [ZipList](#ziplist)
2. [Dict](#dict)

## 1.6 Stream {#stream}

# 2 高级数据类型 {#advanced}

## 2.1 Bitmap {#bitmap}

Bitmap是一个由`01`bit构成的有序序列，可以对其进行**位运算**[^bitwise-operation]。Bitmap的优点是它非常节约存储空间（这和其底层实现有关）。对Bitmap的操作可以分为两类，一类是单个bit的操作，一类是一段bit区间的操作。可以用它来实现布隆过滤器。

常用命令：
1. `SETBIT key offset value`: O(1)。设置offset的bit值，返回offset的旧值。
2. `GETBIT key offset`: O(1)。返回offset的bit值，未设置或者超出范围返回为0。
3. `BITCOUNT key [start end]`: O(N)，N=end-start，单位是字节而不是bit。计算指定位置的1的数量。

```sh
# 设置index=63的位置为1。63的单位是bit。
127.0.0.1:6379> SETBIT bm 63 1
(integer) 0
# 未设置，返回0。
127.0.0.1:6379> GETBIT bm 62
(integer) 0
# 63刚被设置为1。
127.0.0.1:6379> GETBIT bm 63
(integer) 1
# 65超出范围了，返回0。
127.0.0.1:6379> GETBIT bm 65
(integer) 0
# 单位byte，最开始设置的是63bit处，故而需要8个字节，0-7正好包含。故而返回被设置的1的个数1。
127.0.0.1:6379> BITCOUNT bm 0 7
(integer) 1
# 只有第index=7位置的byte被设置过1。故而返回0。
127.0.0.1:6379> BITCOUNT bm 0 6
(integer) 0
# 就是一个string
127.0.0.1:6379> GET bm
"\x00\x00\x00\x00\x00\x00\x00\x01"
# 标准的sds
127.0.0.1:6379> DEBUG OBJECT bm
Value at:0x7fd8fc616a80 refcount:1 encoding:raw serializedlength:9 lru:6589153 lru_seconds_idle:13
```

底层实现：Bitmap底层是[string](#string)类型，因为string最大长度为512MB，故而Bitmap最多可以表示<code>512MB =2<sup>29</sup>byte = 2<sup>32</sup>bit=4294967295(40亿+)</code>。

## 2.2 HyperLogLog {#hyperloglog}

## 2.3 Geospatial Index {#geospatial-index}

# 3 底层实现 {#implementation}

## 3.1 SDS(Simple Dynamic String) {#sds}

redis中的string是可以修改的，底层是用char数组存储的，这就使得它可以对指定的位置进行操作，而又无需创建新的string，可以极大的提升性能。string的完整实现是对应到redis中的sds(Simple Dynamic String)。其中一个定义如下（8，16，32，64的区别）：
{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/sds.h#L45-L74">}}
struct __attribute__ ((__packed__)) sdshdr64 {
    uint64_t len;         /* used */
    uint64_t alloc;       /* excluding the header and null terminator */
    unsigned char flags;  /* 3 lsb of type, 5 unused bits */
    char buf[];           /* data */
};
{{</code-snippet>}}

```sh
127.0.0.1:6379> SET name lnh
OK
127.0.0.1:6379> TYPE name
string
127.0.0.1:6379> STRLEN name
(integer) 3
127.0.0.1:6379> DEBUG OBJECT name
Value at:0x7fe7b0c2e790 refcount:1 encoding:embstr serializedlength:4 lru:5549855 lru_seconds_idle:74
```

`len`字段代表的是string的实际长度，这就使得`STRLEN`的时间复杂度可以达到`O(1)`。

在`DEBUG OBJECT name`命令的响应中显示了`name`相关的存储信息，其中`serializedlength:4`看起来有点奇怪，我们的value的长度明明是`3`，怎么实际是4呢？这是因为方便兼容使用`glibc`的函数库，而在结尾处自动补了一个`\0`的结束符。

当追加新的数据时，如果`alloc`的容量不足，则会触发扩容。当字符串在长度小于1M之前，扩容采用加倍的策略。当长度超过1M后，为了避免加倍后的冗余空间过大而导致浪费，每次扩容只会多分配1M大小的冗余空间。

## 3.2 LinkedList {#linkedlist}

实现代码如下：
{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/adlist.h#L34-L55">}}
typedef struct listNode {
    struct listNode *prev;  // 前一个元素指针
    struct listNode *next;  // 后一个元素指针
    void *value;            // 值的指针
} listNode;

typedef struct list {
    listNode *head;                      // 头部指针
    listNode *tail;                      // 尾部指针
    void *(*dup)(void *ptr);
    void (*free)(void *ptr);
    int (*match)(void *ptr, void *key);
    unsigned long len;                   // 长度
} list;
{{</code-snippet>}}

可以看出它的底层数据结构是一个双向链表，那么其时间复杂度也就等效于链表。演示一下常用的操作：
```sh
127.0.0.1:6379> LPUSH l 1
(integer) 1
127.0.0.1:6379> LPUSH l 2
(integer) 2
127.0.0.1:6379> RPUSH l 3
(integer) 3
127.0.0.1:6379> LLEN l
(integer) 3
127.0.0.1:6379> LRANGE l 0 -1
1) "2"
2) "1"
3) "3"
127.0.0.1:6379> RPOP l
"3"
127.0.0.1:6379> LRANGE l 0 -1
1) "2"
2) "1"
127.0.0.1:6379> DEBUG OBJECT l
Value at:0x7f8990405c20 refcount:1 encoding:quicklist serializedlength:17 lru:5706395 lru_seconds_idle:15 ql_nodes:1 ql_avg_node:2.00 ql_ziplist_max:-2 ql_compressed:0 ql_uncompressed_size:15
```
## 3.3 Dict {#dict}

{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/dict.h#L50-L100">}}
typedef struct dictEntry {
    void *key;                // key
    union {                   // vaue
        void *val;
        uint64_t u64;
        int64_t s64;
        double d;
    } v;
    struct dictEntry *next;   // 下一个元素（key的hash相同时，这些元素构成一个单向链表）
} dictEntry;

typedef struct dictht {
    dictEntry **table;      // entry数组
    unsigned long size;     // 容量大小
    unsigned long sizemask; // hash掩码
    unsigned long used;     // 已用大小
} dictht;
{{</code-snippet>}}

可以看出它的底层实现和java的hashmap很相似，那么其时间复杂度也就等效于hashmap。实际演示如下。
```sh
127.0.0.1:6379> HSET h k1 v1
OK
127.0.0.1:6379> HSET h k2 v2
OK
127.0.0.1:6379> HGET h k1
"v1"
127.0.0.1:6379> HMGET h k1 k2
1) "v1"
2) "v2"
127.0.0.1:6379> HEXISTs h k1
(integer) 1
127.0.0.1:6379> HEXISTs h k2
(integer) 1
127.0.0.1:6379> HEXISTs h k3
(integer) 0
127.0.0.1:6379> HKEYS h
1) "k1"
2) "k2"
127.0.0.1:6379> HVALS h
1) "v1"
2) "v2"
127.0.0.1:6379> HLEN h
(integer) 2
127.0.0.1:6379> HGETALL h
1) "k1"
2) "v1"
3) "k2"
4) "v2"
127.0.0.1:6379> DEBUG OBJECT h
Value at:0x7f8990637db0 refcount:1 encoding:ziplist serializedlength:28 lru:5709958 lru_seconds_idle:9
```

## 3.4 QuickList {#quicklist}

## 3.5 ZipList {#ziplist}

## 3.6 SkipList {#skiplist}

## 3.7 IntSet {#intset}

# 4 总结 {#summary}

# 5 参考 {#reference}

[^data-type]:<https://redis.io/topics/data-types>
[^data-type-intro]:<https://redis.io/topics/data-types-intro>
[^data-type-stream]:<https://redis.io/topics/streams-intro>
[^bitwise-operation]:<https://en.wikipedia.org/wiki/Bitwise_operation>