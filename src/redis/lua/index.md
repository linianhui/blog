---
title: '[redis] lua script'
created_at: 2021-03-19 20:11:22
tag: ["cache", "redis", "lua","dev"]
toc: true
---

redis2.6+在server端内嵌了`lua`[^lua]的支持，可以执行client发送的自定义的`lua script`，使得一些操作逻辑可以放到server上来执行，有利于减少一些不必要的网络交互，从而提升性能。在架构风格上这隶属于`COD(Code On Demand)按需代码`[^cod]，类似于`REST`[^rest]的六大架构约束之一的`COD`约束[^rest-cod]，但是不同的是，这里的COD是运行在server端的。

# 1 命令 {#command}

执行lua script的主要是`EVAL`[^eval]和`EVALSHA`[^evalsha]。
1. `EVAL script numkeys key [key ...] arg [arg ...]`。
2. `EVALSHA sha1 numkeys key [key ...] arg [arg ...]`。

两者的区别在于后者是依赖前者的，两者的唯一不同是第一个参数的差异，EVAL的第一个参数是script本身，而EVALSHA的第一个参数则是script的sha1的值。因为redis-server会在第一次执行script时进行缓存，缓存的唯一标识是script的sha1，如果script一直没有任何变化，那么后续的所有命令，都可以用这个sha1来代替体积更大的script本身，这样可以有效的减少不必要的网络传输。

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
3. **参数3～参数个数**：key。在脚本中通过`KEYS[1]`来表示第几个key，index从1开始。
4. **参数n**：arg。在脚本中通过`ARGV[1]`来表示第几个arg，index也是从1开始。

需要重点注意的是：
1. **script中不要出现写死的key的名字，均应该通过参数传递。**为了redis可以在执行前分析涉及到的key，也为了script是可以进行有效缓存的。
2. **script应该是纯函数式的，即只依赖key和arg的变化来影响结果，而不应该依赖当前时间或者其他非确定的状态数据**


# 2 参考 {#reference}

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