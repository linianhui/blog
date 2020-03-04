---
title: '[Java] JVM(Java Virtual Machine)'
created_at: 2020-03-04 19:32:01
tag: ["Java", "JVM", "Docker"]
toc: true
---


# 1 自制JVM {#1-my-jvm}

<https://github.com/linianhui/div>

# 2 Options {#2-options}

```sh
java -XX:+UnlockDiagnosticVMOptions -XX:+UnlockExperimentalVMOptions -XX:+PrintFlagsFinal -version
```

```sh
# 开启容器支持，并且设置最大内存占用为容器上限的75%。
java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.00 -jar app.jar
```
