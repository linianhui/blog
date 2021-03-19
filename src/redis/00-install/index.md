---
title: '[redis] 00-install'
created_at: 2021-03-19 03:24:23
tag: ["cache", "redis", "install"]
toc: true
---

# 1 源码安装 {#source}

适用于Linux和macOS[^source]。

下载地址：<https://download.redis.io/releases/redis-6.2.1.tar.gz>。

```sh
wget https://download.redis.io/releases/redis-6.2.1.tar.gz
tar xzf redis-6.2.1.tar.gz
cd redis-6.2.1
make
```

编译完成后的二进制文件(`redis-server`,`redis-cli`等等)位于`src`目录中。


# 2 docker安装 {#docker}

<https://hub.docker.com/_/redis>

```sh
docker run --name redis -d redis:6.2
```

# 3 本地运行 {#run}

{{<highlight-file path="redis.conf" lang="ini">}}

## 3.1 运行服务端 {#run-server}

```sh
$ redis-server
5177:C 19 Mar 2021 04:08:38.090 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
5177:C 19 Mar 2021 04:08:38.090 # Redis version=6.2.1, bits=64, commit=00000000, modified=0, pid=5177, just started
5177:C 19 Mar 2021 04:08:38.090 # Warning: no config file specified, using the default config. In order to specify a config file use redis-server /path/to/redis.conf
5177:M 19 Mar 2021 04:08:38.091 * monotonic clock: POSIX clock_gettime
                _._                                                  
           _.-``__ ''-._                                             
      _.-``    `.  `_.  ''-._           Redis 6.2.1 (00000000/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._                                   
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 5177
  `-._    `-._  `-./  _.-'    _.-'                                   
 |`-._`-._    `-.__.-'    _.-'_.-'|                                  
 |    `-._`-._        _.-'_.-'    |           http://redis.io        
  `-._    `-._`-.__.-'_.-'    _.-'                                   
 |`-._`-._    `-.__.-'    _.-'_.-'|                                  
 |    `-._`-._        _.-'_.-'    |                                  
  `-._    `-._`-.__.-'_.-'    _.-'                                   
      `-._    `-.__.-'    _.-'                                       
          `-._        _.-'                                           
              `-.__.-'                                               

5177:M 19 Mar 2021 04:08:38.095 # Server initialized
5177:M 19 Mar 2021 04:08:38.096 * Ready to accept connections
```

## 3.2 运行客户端 {#run-client}

使用`redis-cli`简单测试一下设置和获取一个名为`test`的string类型的缓存。

```sh
$ redis-cli
127.0.0.1:6379> set test blackheart
OK
127.0.0.1:6379> get test
"blackheart"
127.0.0.1:6379> 
```

# 4 online运行 {#online}

<http://try.redis.io>


# 5 参考 {#reference}

<https://redis.io/download>


[^source]:<https://redis.io/download#from-source-code>
