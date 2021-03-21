---
title: '[redis] data type'
created_at: 2021-03-19 19:50:23
tag: ["cache", "redis", "string","list","set","sorted set","hash","module","stream","bitmap","hyperloglog","dev"]
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

其中最常见和用到的有6种：`string`、`list`、`set`、`sorted set`、`hash`、`stream`。
>`module`是server内部使用的，站在client的角度不可见，我们这里也就不关心它了。

## 1.1 String {#string}

redis中的string类型是**二进制安全的字符串**（你可以把一个jpg/exe文件作为value存储进去），value最大不能超过**512M**。
>redis的key就是string类型的，所以key的规则和大小和string完全匹配。key的命名规则的最佳实践通常建议采用`:`分割的具有层级结构的形式，比如`account:1001:followers`。

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

常用命令：
1. `SET key value`[^command-set]：O(1)。设置一个。
2. `MSET key value [key value ...]`[^command-mset]：O(N)，N=k/v数量。批量设置多个。
3. `GET key`[^command-get]：O(1)。获取一个。
4. `MGET key [key ...]`[^command-mget]：O(N)，N=key数量。批量获取多个。
5. `DEL key [key ...]`[^command-del]：O(N)，N=key数量。批量删除多个。
6. `STRLEN key`[^command-strlen]：O(1)。获取长度。
7. `GETDEL key`[^command-getdel]：O(1)。获取并且删除。

## 1.2 List {#list}

list是一个有序的string元素序列，它类似于java中的linkedlist。最大元素数量为<code>2<sup>32</sup>-1=4294967295(40亿+)</code>。实现代码如下：
{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/adlist.h#L34-L55">}}
typedef struct listNode {
    struct listNode *prev;
    struct listNode *next;
    void *value;
} listNode;

typedef struct list {
    listNode *head;
    listNode *tail;
    void *(*dup)(void *ptr);
    void (*free)(void *ptr);
    int (*match)(void *ptr, void *key);
    unsigned long len;
} list;
{{</code-snippet>}}

可以看出它的底层数据结构是一个双向链表，那么其时间复杂度也就等同于链表。演示一下常用的操作：
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

常用命令：
1. `LPUSH key element [element ...]`[^command-lpush]：O(N)，N=element数量。在左侧添加一个或多个。
1. `RPUSH key element [element ...]`[^command-rpush]：O(N)，N=element数量。在右侧添加一个或多个。
2. `LPOP key [count]`[^command-lpop]：O(N)，N=count。在左侧返回一个或多个并删除。
3. `RPOP key [count]`[^command-rpop]：O(N)，N=count。在右侧返回一个或多个并删除。
3. `LEN key`[^command-llen]：O(1)。获取长度。
4. `LRANGE key start_index stop_index`[^command-lrange]：O(N)。返回指定的范围的元素序列，索引从0开始，负数表示从最后一个元素倒数，比如-1是最后一个元素，-2是倒数第二个元素。

## 1.3 Set {#set}

### 1.3.1 实现方式 {#set-implementation}

### 1.3.2 常用命令 {#set-command}

## 1.4 Sorted Set {#sorted-set}

### 1.4.1 实现方式 {#sorted-set-implementation}

### 1.4.2 常用命令 {#sorted-set-command}

## 1.5 Hash {#hash}

### 1.5.1 实现方式 {#hash-implementation}

### 1.5.2 常用命令 {#hash-command}
## 1.6 Stream {#stream}

### 1.6.1 实现方式 {#stream-implementation}

### 1.6.2 常用命令 {#stream-command}

# 2 高级数据类型 {#advanced}

## 2.1 Bitmap {#bitmap}

### 2.1.1 实现方式 {#bitmap-implementation}

### 2.1.2 常用命令 {#bitmap-command}

## 2.2 HyperLogLog {#hyperloglog}

### 2.2.1 实现方式 {#hyperloglog-implementation}

### 2.2.2 常用命令 {#hyperloglog-command}

# 3 总结 {#summary}

# 4 参考 {#reference}

[^data-type]:<https://redis.io/topics/data-types>
[^data-type-intro]:<https://redis.io/topics/data-types-intro>
[^data-type-stream]:<https://redis.io/topics/streams-intro>
[^command-set]:<https://redis.io/commands/set>
[^command-mset]:<https://redis.io/commands/mset>
[^command-get]:<https://redis.io/commands/get>
[^command-mget]:<https://redis.io/commands/mget>
[^command-del]:<https://redis.io/commands/del>
[^command-getdel]:<https://redis.io/commands/getdel>
[^command-strlen]:<https://redis.io/commands/strlen>
[^command-lpush]:<https://redis.io/commands/lpush>
[^command-rpush]:<https://redis.io/commands/rpush>
[^command-lpop]:<https://redis.io/commands/lpop>
[^command-rpop]:<https://redis.io/commands/rpop>
[^command-llen]:<https://redis.io/commands/llen>
[^command-lrange]:<https://redis.io/commands/lrange>
