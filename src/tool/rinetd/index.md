---
title: "[工具] rinetd"
created_at: 2021-03-23 23:01:03
tag: ["port","port-forward","rinetd","netsh","iptables",'network','tool']
toc: true
---

# 1 概述 {#overview}

c语言开发的一个端口转发转发工具，非常小巧方便，比`iptables`方便使用。或者像是在`macOS`这种不支持转发到`remote ip`的系统下。
> windows 下有内置的`netsh interface portproxy add v4tov4 listenport=80 connectaddress=192.168.2.201 connectport=80`可以使用。

```sh
# 查看帮助
rinetd -h

# 前台运行，并且指定配置文件
rinetd --foreground --conf-file rinetd.conf
```

{{<highlight-file path="rinetd.conf" lang="ini">}}

## 1.1 macOS 安装 {#macos-install}

```sh
brew install rinetd
```

或者源码自己编译安装。
```sh
git clone https://github.com/samhocevar/rinetd.git
chmod +x bootstrap
./bootstrap
./configure
make
```
然后你可以在当前目录得到一个`rinetd`可执行程序。

# 2 参考 {#reference}

官网：<http://www.rinetd.com/>
源码：<https://github.com/samhocevar/rinetd>
