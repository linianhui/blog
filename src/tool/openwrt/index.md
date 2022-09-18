---
title: "[工具] openwrt"
created_at: 2017-03-23 23:01:03
tag: ["openwrt","v2ray","breed","mtd"]
toc: true
noHome: true
---

# 1 flush

## 1.1 breed {#breed}

`breed`[^breed]是一个bootloader，类似与电脑中的BIOS以及安卓手机中的recovery，用来刷机用的。

```sh
# 登陆到路由器
ssh root@10.1.199.1

# 复制breed.bin到路由器
scp breed.bin ssh root@10.1.199.1:/root/

# 刷入breed
mtd -r write breed.bin u-boot
```

成功刷入后路由器会自动重启，启动后长按重置键3～6秒松开即可进入breed模式。breed的默认ip为`192.168.1.1`，故而需要网线连接路由器的LAN口到电脑网口，电脑设置IP如下：
```sh
ip      192.168.1.2
netmask 255.255.255.0
dns     192.168.1.1
```
然后访问<http://192.168.1.1>即可。

## 1.2 openwrt {#openwrt}

`openwrt`[^openwrt]直接用`mtd`刷入也可以。

```sh
# 刷路由器固件
mtd -r write openwrt.bin firmware
```

# 2 software {#software}

## 2.1 openwrt-v2ray {#openwrt-v2ray}

`openwrt-v2ray`[^openwrt-v2ray]安装步骤
1. `ca-certificates`：在线安装即可。
2. `v2ray-core-mini_4.37.3-1_mipsel_24kc.ipk`：下载ipk文件，上传安装。

默认的安装目录`/usr/bin/v2ray`。
```sh
# 复制相关的配置文件
scp config.json geoip.dat geosite.dat root@10.1.199.1:/usr/bin/
```

# 3 reference {#reference}

1. `local_token`: <http://hiwifi.com/local-ssh>
2. `uuid`: <http://hiwifi.com/cgi-bin/turbo/proxy/router_info>


[^breed]:breed官网：<https://breed.hackpascal.net>
[^openwrt]:openwrt：<https://openwrt.org/toh/views/toh_fwdownload> <https://openwrt.org/docs/guide-user/start#installation>
[^openwrt-v2ray]:openwrt-v2ray项目地址：<https://github.com/kuoruan/openwrt-v2ray/>


