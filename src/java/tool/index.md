---
title: '[Java] Tool'
created_at: 2020-03-04 19:32:01
tag: ["Java", "jps", "jinfo", "jstat", "jmap", "jstack"]
toc: true
---


# 1 jps {#jps}

```sh
# print java pid
jps -v
```

# 2 jinfo {#jinfo}

```sh
# print pid=1 JVM flags
jinfo -flags 1

# print pid=1 Java system properties
jinfo -sysprops 1
```

# 3 jstat {#jstat}

```sh
jstat -options

# print pid=1 gc
jstat -gc 1
```

# 4 jmap {#jmap}

```sh
# print pid=1 java heap summary
jmap -heap 1
```

# 5 jstack {#jstack}

```sh
# print pid=123 java therad 
jstack 123
```

