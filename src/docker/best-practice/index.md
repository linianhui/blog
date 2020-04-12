---
title: '[Docker] Best Practice'
created_at: 2018-01-28 16:53:01
tag: ["docker","Best Practice","PID","ENTRYPOINT","bash"]
toc: true
---

# 1 ENTRYPOINT {#entrypoint} 

推荐使用ENTRYPOINT(不要和CMD同时使用) : 当ENTRYPOINT存在时，CMD会作为它的参数存在，增加复杂性。ENTRYPOINT有一下两种格式。

## 1.1 EXEC {#entrypoint-exec}

```dockerfile
ENTRYPOINT ["executable", "param1", "param2"]
```
虽然官方推荐使用EXEC方式，推荐理由是[PID]=1，但是EXEC的参数无法解析ENV，故而在需要ENV时并无法使用。比如:
```dockerfile
# 无效的，无法读取$JAVA_OPTIONS，但是PID=1。
ENTRYPOINT ["java", "$JAVA_OPTIONS", "-jar", "app.jar]
```

## 1.2 SHELL {#entrypoint-shell}

```dockerfile
ENTRYPOINT command param1 param2
```
上述命令会被转换成`/bin/sh -c "command param1 param2"`, 此时可以使用ENV的（但是[PID]不一定为=1，要看实际情况）。比如:
```dockerfile
# 有效的，可以读取$JAVA_OPTIONS, 但是PID不一定=1。
ENTRYPOINT java $JAVA_OPTIONS -jar app.jar]
```

参考资料 : <https://docs.docker.com/engine/reference/builder/#entrypoint>

# 2 PID {#pid}

容器内的进程PID=1时才可以接受UNXI的信号信息，比如stop或者kill容器的时候。

1. [ENTRYPOINT EXEC][ENTRYPOINT-EXEC] : 使用`exec`执行调用，所以默认情况下第一个命令的PID就是1。
2. [ENTRYPOINT SHELL][ENTRYPOINT-SHELL] : 使用`/bin/sh -c`执行调用,分两种情况:
    1. sh是`bash`的软连接: 得益于`bash`的优化，PID也是1。
    2. sh是`dash`的软连接: PID不是1, 不过`dash`也有跟进这个优化，新版`dash`也是1。

示例:
```dockerfile
FROM openjdk:8u232

WORKDIR /app

# /bin/sh默认是dash，改成bash可以使得ENTRYPOINT SHELL方式PID=1, 同时可以使用ENV。
RUN ln -sf /bin/bash /bin/sh

ENV JAVA_OPTIONS='-XX:+UseG1GC -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.00'

COPY target/xxx.jar app.jar

ENTRYPOINT java $JAVA_OPTIONS -jar app.jar

EXPOSE 80
```


参考连接
1. <https://stackoverflow.com/questions/39434493/bash-c-vs-dash-c>
2. <https://stackoverflow.com/questions/52968361/different-process-are-running-as-pid-1-when-running-cmd-entrypoint-in-shell-form>

# 3 Reference {#reference}

https://www.docker.com/blog/intro-guide-to-dockerfile-best-practices/

[ENTRYPOINT-EXEC]:#entrypoint-exec
[ENTRYPOINT-SHELL]:#entrypoint-shell
[PID]:#pid
