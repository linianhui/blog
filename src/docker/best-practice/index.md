---
title: '[Docker] Best Practice'
created_at: 2020-04-12 17:13:01
tag: ["docker","Best Practice","PID","ENTRYPOINT","bash","dash"]
toc: true
---

# 1 ENTRYPOINT {#entrypoint} 

推荐使用ENTRYPOINT(不要和CMD同时使用) : 当ENTRYPOINT存在时，CMD会作为它的参数存在，增加复杂性。ENTRYPOINT指令[ENTRYPOINT EXEC][ENTRYPOINT-EXEC]和[ENTRYPOINT SHELL][ENTRYPOINT-SHELL]两种语法形式。但是不管是那种形式，都只是dockerfile中的语法形式，实际build后的结果都是统一的JSON数组格式。

## 1.1 EXEC {#entrypoint-exec}

```dockerfile
ENTRYPOINT ["executable", "param1", "param2"]
```
ENTRYPOINT指令后面是JSON数组, 由于是JSON数组，那么则只能使用双引号`"`而不是单引号`'`。**官方推荐使用EXEC方式，推荐理由是默认[PID]=1，但是默认的写法无法解析ENV**。**这里也推荐使用EXEC的方式，理由是保持和build后的结果是完全一致的清晰性**。比如一下示例：

```bash
# 不需要解析ENV的场景
docker build -t entrypoint-inspect:exec1 -<<-'EOF'
FROM alpine
ENTRYPOINT ["echo", "PWD=$PWD"]
EOF

# 查看build后的Entrypoint
docker inspect entrypoint-inspect:exec1 --format '{{json .Config.Entrypoint}}'

# 输出
[
  "echo",
  "PWD=$PWD"
]

# 执行
docker run --rm entrypoint-inspect:exec1

# 输出，可见$PWD没有被解析
PWD=$PWD
```

```bash
# 需要解析ENV的场景
docker build -t entrypoint-inspect:exec2 -<<-'EOF'
FROM alpine
ENTRYPOINT ["/bin/sh", "-c", "echo PWD=$PWD"]
EOF

# 查看build后的Entrypoint
docker inspect entrypoint-inspect:exec2 --format '{{json .Config.Entrypoint}}'

# 输出
[
  "/bin/sh",
  "-c",
  "echo PWD=$PWD"
]

# 执行
docker run --rm entrypoint-inspect:exec2

# 输出，可见$PWD已经被解析
PWD=/
```

## 1.2 SHELL {#entrypoint-shell}

```dockerfile
ENTRYPOINT command param1 param2
```
上述指令build后会被转换成`["/bin/sh", "-c", "command param1 param2"]`, 此时可以使用ENV的。但是并不推荐，因为其存在转换逻辑，不够清晰，而且`/bin/sh -c`的行为并不是固定的(参见[PID])。示例:

```bash
docker build -t entrypoint-inspect:shell1 -<<-'EOF'
FROM alpine
ENTRYPOINT echo PWD=$PWD
EOF

# 查看build后的Entrypoint
docker inspect entrypoint-inspect:shell1 --format '{{json .Config.Entrypoint}}'

# 输出，可以发现完全等于:ENTRYPOINT ["/bin/sh", "-c", "echo PWD=$PWD"]
[
  "/bin/sh",
  "-c",
  "echo PWD=$PWD"
]

# 执行
docker run --rm entrypoint-inspect:shell1

# 输出，可见$PWD已经被解析
PWD=/
```

参考资料：
1. <https://docs.docker.com/engine/reference/builder/#cmd>
2. <https://docs.docker.com/engine/reference/builder/#entrypoint>

# 2 PID {#pid}

容器内的进程PID=1时才可以接受UNXI的信号信息，比如`docker stop`或者`docker kill`容器的时候。`docker build`后的`.[0].Config.Entrypoint`中的**第一个元素是一个可执行程序，它的PID=1**。比如一下示例。

当ENTRYPOINT是如下格式的时候：
```json
[
  "echo",
  "PWD=$PWD"
]
```
这时`echo`的`PID=1`。

当ENTRYPOINT是如下格式的时候：
```json
[
  "/bin/sh",
  "-c",
  "echo PWD=$PWD"
]
```
这时`sh`的`PID=1`，但是`echo`是不是1并不确定，它依赖`sh`的具体行为。存在一下两种情况：
1. `sh`是`bash`的软连接: 得益于`bash`的优化，`echo`的`PID`也是1。
2. `sh`是`dash`的软连接: `echo`的`PID`不是1, 不过`dash`也有跟进这个优化，新版`dash`也是1。

参考连接：
1. <https://stackoverflow.com/questions/39434493/bash-c-vs-dash-c>
2. <https://stackoverflow.com/questions/52968361/different-process-are-running-as-pid-1-when-running-cmd-entrypoint-in-shell-form>

# 3 Reference {#reference}

https://www.docker.com/blog/intro-guide-to-dockerfile-best-practices/

[ENTRYPOINT-EXEC]:#entrypoint-exec
[ENTRYPOINT-SHELL]:#entrypoint-shell
[PID]:#pid
