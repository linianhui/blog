---
title: "[计算机网络] Tool"
created_at: 2020-02-20 21:52:00
tag: ["dig"]
toc: true
---

# dig {#dig}

```sh
dig bing.com
```

# netsh {#netsh}

```powershell
# port forward 127.0.0.1:12345 to http://www.nghttp2.org
netsh interface portproxy add v4tov4 listenport=12345 connectaddress=139.162.123.134 connectport=80

# show all
netsh interface portproxy show all

# delete all
netsh interface portproxy reset

# delete one
netsh interface portproxy delete v4tov4 listenport=12345

# help
netsh interface portproxy help
```

# net-tools {#net-tools}

```sh
apt install -y net-tools
```

## netstat {#netstat}

| short option | full option                                                                 |
| ------------ | --------------------------------------------------------------------------- |
| -h           | --help                                                                      |
| -V           | --version                                                                   |
| -n           | --numeric <br/> --numeric-hosts <br/> --numeric-ports <br/> --numeric-users |
| -t           | --tcp                                                                       |
| -u           | --udp                                                                       |
| -x           | --unix                                                                      |

状态统计
```sh
netstat -n | awk '/^tcp/ {++S[$NF]} END {for(a in S) print a, S[a]}'
```

TIME_WAIT状态统计
```sh
netstat -n | awk '/TIME_WAIT/ {++S[$4]} END {for(a in S) print a, S[a]}' | sort -r -n -k2 -t' '
```

# nslookup {#nslookup}

```sh
nslookup bing.com
```


# iproute2 {#iproute2}

```sh
apt install -y iproute2
```

## ss

| short option | full option |
| ------------ | ----------- |
| -h           | --help      |
| -V           | --version   |
| -a           | --all       |
| -n           | --numeric   |
| -t           | --tcp       |
| -u           | --udp       |
| -x           | --unix      |
| -4           | --ipv4      |
| -6           | --ipv6      |
| -H           | --no-header |

```sh
ss -tan | awk 'NR>1 {++S[$1]} END {for (a in S) print a,S[a]}'
```

# tcpdump {#tcpdump}

```sh
apt install -y tcpdump
```

| option                             | description                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| -h, --help                         | show help                                                                                |
| --version                          | show version                                                                             |
| -A                                 | Print each packet (minus its link level header) in ASCII. Handy for capturing web pages. |
| -c                                 | Exit after receiving count packets.                                                      |
| -s,--snapshot-length               | Snarf snaplen bytes of data from each packet                                             |
| -S,--absolute-tcp-sequence-numbers | Print absolute, rather than relative, TCP sequence numbers.                              |


```sh
# 抓包到文件
tcpdump port 80 -w http-80.pcap

# 解析80端口的100个包
tcpdump port 80 -A -c 100
```

参考 : https://www.tcpdump.org/manpages/tcpdump.1.html



# wireshark 

preferences
```sh
gui.column.format: 
	"#", "%m",
	"time", "%t",
	"s.mac", "%uhs",
	"s.ip", "%us",
	"s.port", "%uS",
	"protocol", "%p",
	"d.mac", "%uhd",
	"d.ip", "%ud",
	"d.port", "%uD",
	"length", "%L",
	"info", "%i"
```
