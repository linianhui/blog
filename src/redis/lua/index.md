---
title: '[redis] lua script'
created_at: 2021-03-19 20:11:22
tag: ["cache", "redis", "lua","dev"]
toc: true
---

redis2.6+在server端内嵌了`lua`[^lua]的支持，可以执行client发送的自定义的`lua script`，使得一些操作逻辑可以放到server上来执行，有利于减少一些不必要的网络交互，从而提升性能。在架构风格上这隶属于`COD(Code On Demand)按需代码`[^cod]，类似于`REST`[^rest]的六大架构约束之一的`COD`约束[^rest-cod]，但是不同的是，这里的COD是运行在server端的。

# 1 命令 {#command}

执行lua script的主要是`EVAL`[^command-eval]和`EVALSHA`[^command-evalsha]。
1. `EVAL script numkeys key [key ...] arg [arg ...]`。
2. `EVALSHA sha1 numkeys key [key ...] arg [arg ...]`。

两者的唯一不同是第一个参数的差异，EVAL的第一个参数是script本身，而EVALSHA的第一个参数则是script的sha1的值。因为redis-server会在第一次执行script时进行缓存，缓存的唯一标识是script的sha1，如果script一直没有任何变化，那么后续的所有命令，都可以用这个sha1来代替体积更大的script本身，这样可以有效的减少不必要的网络传输。

EVAL的语法看起来有点奇怪，其实是很合理的。比如一下代码：
```sh
127.0.0.1:6379> EVAL "return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}" 2 k1 k2 k1value k2value
1) "k1"
2) "k2"
3) "k1value"
4) "k2value"
```
1. **参数1**是script本身。
2. **参数2**是表示有几个key。目的在于区分key和arg，也是为了redis在运行script前可以分析得知涉及到了那些key。
3. **参数key**：在脚本中通过`KEYS[1]`来表示第几个key，index从1开始。
4. **参数arg**：在脚本中通过`ARGV[1]`来表示第几个arg，index也是从1开始。

需要重点注意的是：
1. **script中不要出现写死的key的名字，均应该通过参数传递**。
2. **script应该是纯函数式的，即只依赖key和arg的变化来影响结果，而不应该依赖当前时间或者其他非确定的状态数据**。
3. **script是一个整体，具备原子性，不会被其他的命令所中断**。

# 2 Script Cache {#script-cache}

比如这个script字符串`return redis.call('get',KEYS[1])`，其SHA1是`fd758d1589d044dd850a6f05d52f2eefd27f033f`。
1. 这个SHA1我们可以在应用中自己计算。
2. 也可以使用`SCRIPT LOAD`[^command-script-load]交由redis-server来缓存计算。
  
比如如下两个方式是完全等价的。
```sh
# EVAL自动缓存脚本。
127.0.0.1:6379> EVAL "return redis.call('get',KEYS[1])" 1 name
"lnh"
# 然后使用我们自己计算的sha1取执行脚本。
127.0.0.1:6379> EVALSHA fd758d1589d044dd850a6f05d52f2eefd27f033f 1 name
"lnh"

# 使用`SCRIPT LOAD`来预先缓存script，然后返回的sha1。
127.0.0.1:6379> SCRIPT LOAD "return redis.call('get',KEYS[1])"
"fd758d1589d044dd850a6f05d52f2eefd27f033f"
# 然后使用返回的sha1取执行脚本。
127.0.0.1:6379> EVALSHA fd758d1589d044dd850a6f05d52f2eefd27f033f 1 name
"lnh"

# 当sha1无效或者不存在时
127.0.0.1:6379> evalsha 1234561589d044dd850a6f05d52f2eefd27f033f 1 name
(error) NOSCRIPT No matching script. Please use EVAL.
```

被缓存的script永远不会被主动删除，除非手动调用`SCRIPT FLUSH`[^command-script-flush]才会清除缓存。

# 3 错误处理 {#error-handler}

使用redis.call()或redis.pcall()来执行redis命令操作时，两者唯一的区别在于出错时的错误处理方式不同。
```sh
# 准备一个value为string的key
127.0.0.1:6379> SET s abc
OK

# 对key进行自增，查看错误提示的差异。

# 返回了详细的错误，包括script的sha1
127.0.0.1:6379> EVAL "return redis.call('INCR',KEYS[1])" 1 s
(error) ERR Error running script (call to f_da8455f0535fd532821b3713a4eccd80fc4b8457): @user_script:1: ERR value is not an integer or out of range

# 只返回错误原因，没有script相关的信息。
127.0.0.1:6379> EVAL "return redis.pcall('INCR',KEYS[1])" 1 s
(error) ERR value is not an integer or out of range
``` 

# 4 参考 {#reference}

[^lua]:<http://www.lua.org/docs.html>
[^ldb]:<https://redis.io/topics/ldb>
[^cod]:<https://linianhui.github.io/understand-rest/04-network-based-software-architecture-style/#code-on-demand>
[^rest]:<https://linianhui.github.io/understand-rest/>
[^rest-cod]:<https://linianhui.github.io/understand-rest/05-web-and-rest/#code-on-demand>

[^command-eval]:<https://redis.io/commands/eval>
[^command-evalsha]:<https://redis.io/commands/evalsha>
[^command-script-load]:<https://redis.io/commands/script-load>
[^command-script-kill]:<https://redis.io/commands/script-kill>
[^command-script-debug]:<https://redis.io/commands/script-debug>
[^command-script-exists]:<https://redis.io/commands/script-exists>
[^command-script-flush]:<https://redis.io/commands/script-flush>