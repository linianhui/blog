---
title: '[redis] data type'
created_at: 2021-03-19 19:50:23
tag: ["cache", "redis", "string","list","set","sorted set","hash","module","stream","bitmap","hyperloglog","sds","dev"]
toc: true
---

redis支持丰富的数据类型[^data-type]。我们这里从两个角度来介绍：
1. client使用：client可以使用到的数据类型。
2. server实现：server内部的具体实现。

# 1 client使用 {#client}
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

底层encoding：
1. [int](#int)
2. [sds](#sds)
3. [embstr](#embstr)

## 1.2 List {#list}

list是一个有序的string元素序列，它类似于java中的linkedlist。最大元素数量是<code>2<sup>32</sup>-1=4294967295(40亿+)</code>。

常用命令：
1. `LPUSH key element [element ...]`：O(N)，N=element数量。在左侧添加一个或多个。
2. `RPUSH key element [element ...]`：O(N)，N=element数量。在右侧添加一个或多个。
3. `LPOP key [count]`：O(N)，N=count。在左侧返回一个或多个并删除。
4. `RPOP key [count]`：O(N)，N=count。在右侧返回一个或多个并删除。
5. `LLEN key`：O(1)。获取长度。
6. `LRANGE key start_index stop_index`：O(N)。返回指定的范围的元素序列，索引从0开始，负数表示从最后一个元素倒数，比如-1是最后一个元素，-2是倒数第二个元素。

底层encoding：
1. [quicklist](#quicklist)
2. [linkedlist](#linkedlist)
3. [ziplist](#ziplist)

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

底层encoding：
1. [intset](#intset)
2. [dict](#dict)

## 1.4 ZSet {#zset}

类似set，不同之处它是有序的。

底层encoding：
1. [ziplist](#ziplist)
2. [skiplist](#skiplist)

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

底层encoding：
1. [ziplist](#ziplist)
2. [dict](#dict)

## 1.6 Stream {#stream}

## 1.7 Bitmap {#bitmap}

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

底层encoding：
1. Bitmap底层是[string](#string)类型，因为string最大长度为512MB，故而Bitmap最多可以表示<code>512MB =2<sup>29</sup>byte = 2<sup>32</sup>bit=4294967295(40亿+)</code>。

## 1.8 HyperLogLog {#hyperloglog}

## 1.9 Geospatial Index {#geospatial-index}

# 2 server实现 {#server}

上面介绍了从client使用者的角度可以使用的9种数据类型。下面介绍下server端是如何实现的。

## 2.1 redisDb {#redisdb}

我们来看一下redis-server的db数据存储结构。

{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/server.h#L1158-L1613">}}
struct redisServer {
    // redisDb数组。
    redisDb *db;
    // 配置的db数量。
    int dbnum;
}
{{</code-snippet>}}

一个redis-server的实例在默认会维护16个db，默认是`db 0`，可以使用`SELECT <dbid>`来切换。
{{<code-snippet lang="ini" href="https://github.com/redis/redis/blob/6.2/redis.conf#L314-L317">}}
databases 16
{{</code-snippet>}}

db之间是完全隔离的。比如：
```sh
127.0.0.1:6379> SET name lnh0
OK
127.0.0.1:6379> GET name
"lnh0"
127.0.0.1:6379> SELECT 1
OK
127.0.0.1:6379[1]> GET name
(nil)
127.0.0.1:6379[1]> 
```

再看一下`redisDb`的结构。
{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/server.h#L702-L715">}}
typedef struct redisDb {
    dict *dict;                 /* The keyspace for this DB */
    dict *expires;              /* Timeout of keys with a timeout set */
    dict *blocking_keys;        /* Keys with clients waiting for data (BLPOP)*/
    dict *ready_keys;           /* Blocked keys that received a PUSH */
    dict *watched_keys;         /* WATCHED keys for MULTI/EXEC CAS */
    int id;                     /* Database ID */
    long long avg_ttl;          /* Average TTL, just for stats */
    unsigned long expires_cursor; /* Cursor of the active expire cycle. */
    list *defrag_later;         /* List of key names to attempt to defrag one by one, gradually. */
} redisDb;
{{</code-snippet>}}

可以看到它包含了`id`来标识数据库，然后使用[dict](#dict)来存储我们的数据。

## 2.2 redisObject {#redisobject}

所有数据都是存放在这个巨大的[dict](#dict)中，其中key是固定的[string](#string)类型，但是value却是各种个样的，那么dict如何使用统一的方式来存储value呢？这就需要一个统一的结构来表示dict种的对象，这个结构就是`redisObject`。

redis源码中定义了7中基本类型，redis正是用这7种基本数据类型实现了上述的9种数据类型。

{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/server.h#L499-L521">}}
#define OBJ_STRING 0    /* String object. */
#define OBJ_LIST 1      /* List object. */
#define OBJ_SET 2       /* Set object. */
#define OBJ_ZSET 3      /* Sorted set object. */
#define OBJ_HASH 4      /* Hash object. */
#define OBJ_MODULE 5    /* Module object. */
#define OBJ_STREAM 6    /* Stream object. */
{{</code-snippet>}}

{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/server.h#L667-L675">}}
typedef struct redisObject {
    unsigned type:4;       // 上面的7种基本数据类型。
    unsigned encoding:4;   // 下面的11种具体编码类型。
    unsigned lru:LRU_BITS; // expire信息
    int refcount;          // 引用计数
    void *ptr;             // 数据指针，指向具体的encoding数据
} robj;
{{</code-snippet>}}

{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/server.h#L645-L58">}}
#define OBJ_ENCODING_RAW 0        /* Raw representation */
#define OBJ_ENCODING_INT 1        /* Encoded as integer */
#define OBJ_ENCODING_HT 2         /* Encoded as hash table */
#define OBJ_ENCODING_ZIPMAP 3     /* Encoded as zipmap */
#define OBJ_ENCODING_LINKEDLIST 4 /* No longer used: old list encoding. */
#define OBJ_ENCODING_ZIPLIST 5    /* Encoded as ziplist */
#define OBJ_ENCODING_INTSET 6     /* Encoded as intset */
#define OBJ_ENCODING_SKIPLIST 7   /* Encoded as skiplist */
#define OBJ_ENCODING_EMBSTR 8     /* Embedded sds string encoding */
#define OBJ_ENCODING_QUICKLIST 9  /* Encoded as linked list of ziplists */
#define OBJ_ENCODING_STREAM 10    /* Encoded as a radix tree of listpacks */
{{</code-snippet>}}

它的用途是作为一个桥梁，一段映射到7种基本数据类型上面，一端链接到底层的编码存储上，同时也保存着expire信息。

## 2.3 encoding {#encoding}

### 2.3.0 sds {#sds}

为了实现二进制安全的字符串，redis并没有直接采用c语言中的string类型，而是自定义了一个sds(Simple Dynamic String)的数据结构。其中一个定义如下（8，16，32，64的区别）：
{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/sds.h#L45-L74">}}
struct __attribute__ ((__packed__)) sdshdr64 {
    uint64_t len;         /* used */
    uint64_t alloc;       /* excluding the header and null terminator */
    unsigned char flags;  /* 3 lsb of type, 5 unused bits */
    char buf[];           /* data */
};
{{</code-snippet>}}

1. `len`：代表的是string的实际长度，这就使得`STRLEN`的时间复杂度可以达到`O(1)`。
2. `alloc`：预先分配的长度。
3. `flags`：标记位，前三bit代表类型。
4. `buf`：实际的数据。

```sh
127.0.0.1:6379> SET name 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGH
OK
127.0.0.1:6379> GET name
"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGH"
127.0.0.1:6379> STRLEN name
(integer) 44
127.0.0.1:6379> DEBUG OBJECT name
Value at:0x7fcb9f8346f0 refcount:1 encoding:raw serializedlength:45 lru:6671789 lru_seconds_idle:3
```

在`DEBUG OBJECT name`命令的响应中显示了`name`相关的存储信息：`encoding:raw`指的就是sds；其中`serializedlength:4`看起来有点奇怪，我们的value的长度明明是`44`，怎么实际是`45`呢？这是因为方便兼容使用`glibc`的函数库，而在结尾处自动补了一个`\0`的结束符。而且sds的指针的位置实际是指向`buf`字段的位置，这使得它可以当作一个正常的c字符串来使用。

当追加新的数据时，如果`alloc`的容量不足，则会触发扩容。当字符串在长度小于1M之前，扩容采用加倍的策略。当长度超过1M后，为了避免加倍后的冗余空间过大而导致浪费，每次扩容只会多分配1M大小的冗余空间。

### 2.3.1 int {#int}

当string是一个整数时，会采用int方式进行存储。其实际范围是int64。

```sh
# 最小整数
127.0.0.1:6379> SET minnumber -9223372036854775808
OK
# encoding:int
127.0.0.1:6379> DEBUG OBJECT minnumber
Value at:0x7fcb9ef0e7d0 refcount:1 encoding:int serializedlength:21 lru:6671270 lru_seconds_idle:15

# 比int64最小值还小，就变成了encoding:embstr
127.0.0.1:6379> SET minnumber -9223372036854775809
OK
127.0.0.1:6379> DEBUG OBJECT minnumber
Value at:0x7fcb9ec18b00 refcount:1 encoding:embstr serializedlength:21 lru:6671297 lru_seconds_idle:2

# 最大整数
127.0.0.1:6379> SET maxnumber 9223372036854775807
OK
# encoding:int
127.0.0.1:6379> DEBUG OBJECT maxnumber
Value at:0x7fcb9ec15950 refcount:1 encoding:int serializedlength:20 lru:6671334 lru_seconds_idle:10

# 比int64最大值还大，也变成了encoding:embstr
127.0.0.1:6379> SET maxnumber 9223372036854775808
OK
127.0.0.1:6379> DEBUG OBJECT maxnumber
Value at:0x7fcb9f8346c0 refcount:1 encoding:embstr serializedlength:20 lru:6671350 lru_seconds_idle:2

# 浮点数也是encoding:embstr
127.0.0.1:6379> SET floatnumber 1.1
OK
127.0.0.1:6379> DEBUG OBJECT floatnumber
Value at:0x7fcb9ec296e0 refcount:1 encoding:embstr serializedlength:4 lru:6671548 lru_seconds_idle:14
```

### 2.3.2 dict {#dict}

底层实现和java的hashmap很相似。

{{<code-snippet lang="c" href="https://github.com/redis/redis/blob/6.2/src/dict.h#L50-L100">}}
typedef struct dict {
    dictType *type;         
    void *privdata;
    dictht ht[2];
    long rehashidx;          // /* rehashing not in progress if rehashidx == -1 */
    int16_t pauserehash;     //* If >0 rehashing is paused (<0 indicates coding error) */
} dict;

typedef struct dictType {
    uint64_t (*hashFunction)(const void *key);
    void *(*keyDup)(void *privdata, const void *key);
    void *(*valDup)(void *privdata, const void *obj);
    int (*keyCompare)(void *privdata, const void *key1, const void *key2);
    void (*keyDestructor)(void *privdata, void *key);
    void (*valDestructor)(void *privdata, void *obj);
    int (*expandAllowed)(size_t moreMem, double usedRatio);
} dictType;

typedef struct dictht {
    dictEntry **table;      // entry数组
    unsigned long size;     // 容量大小
    unsigned long sizemask; // hash掩码
    unsigned long used;     // 已用大小
} dictht;

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
{{</code-snippet>}}

实际演示如下。
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

### 2.3.3 zipmap {#zipmap}


### 2.3.4 linkedlist {#linkedlist}

linkedlist的底层数据结构是一个双向链表。
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

演示一下常用的操作：
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

### 2.3.5 ziplist {#ziplist}

### 2.3.6 intset {#intset}

### 2.3.7 skiplist {#skiplist}

### 2.3.8 embstr {#embstr}

### 2.3.9 quicklist {#quicklist}

### 2.3.10 stream {#stream}


# 3 总结 {#summary}

# 4 参考 {#reference}

[^data-type]:<https://redis.io/topics/data-types>
[^data-type-intro]:<https://redis.io/topics/data-types-intro>
[^data-type-stream]:<https://redis.io/topics/streams-intro>
[^bitwise-operation]:<https://en.wikipedia.org/wiki/Bitwise_operation>