---
title: "[工具] openwrt"
created_at: 2017-03-23 23:01:03
tag: ["openwrt","v2ray","breed","mtd"]
toc: true
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

aliyun-mirror:<https://mirrors.aliyun.com/openwrt/releases/22.03.2/targets/x86/64/>
```bash
# mirror
sed -i 's_downloads.openwrt.org_mirrors.aliyun.com/openwrt_' /etc/opkg/distfeeds.conf

# 安装ca-certificates
opkg update
opkg install ca-certificates
```

## 1.3 upgrade {#upgrade}

<https://firmware-selector.openwrt.org/>

### 1.3.1 initramfs-kernel

测试用，不会保存任何设置。

<https://downloads.openwrt.org/releases/22.03.2/targets/ramips/mt7621/openwrt-22.03.2-ramips-mt7621-hiwifi_hc5962-initramfs-kernel.bin>

### 1.3.2 squashfs-factory

从bootloader安装的包，会抹除当前设置，相当于重新安装。不过可以从旧版的openwrt导出 config archive文件，然后再恢复。

<https://downloads.openwrt.org/releases/22.03.2/targets/ramips/mt7621/openwrt-22.03.2-ramips-mt7621-hiwifi_hc5962-squashfs-factory.bin>

### 1.3.3 squashfs-sysupgrade

从openwrt升级openwrt的包，可以保留当前版本设置。

<https://downloads.openwrt.org/releases/22.03.2/targets/ramips/mt7621/openwrt-22.03.2-ramips-mt7621-hiwifi_hc5962-squashfs-sysupgrade.bin>

# 2 software {#software}

## 2.1 openwrt-v2ray {#v2ray}

`openwrt-v2ray`[^openwrt-v2ray]安装步骤
1. `ca-certificates`：在线安装即可。
2. `v2ray-core-mini_4.37.3-1_mipsel_24kc.ipk`：下载ipk文件，上传安装。

默认的安装目录`/usr/bin/v2ray`。
```sh
# 复制相关的配置文件
scp config.json geoip.dat geosite.dat root@10.1.199.1:/usr/bin/
```

## 2.2 USB {#usb}

{{<highlight-file path="usb.sh" lang="sh">}}


## 2.3 Samba {#samba}

{{<highlight-file path="samba.sh" lang="sh">}}

## 2.4 Stats {#samba}

{{<highlight-file path="stats.sh" lang="sh">}}

# 3 x86 {#x86}

mirror: <https://developer.aliyun.com/mirror/openwrt>
x86:<https://downloads.openwrt.org/releases/22.03.2/targets/x86/64/>
download:<https://downloads.openwrt.org/releases/22.03.5/targets/x86/64/openwrt-22.03.5-x86-64-generic-ext4-combined.img.gz>

各版本区别
1. squashfs : 只读文件系统，支持重置，不支持扩容。
2. ext4 : 可读写，不支持重置，支持扩容。

```sh
vim /etc/config/network
# add wan
# 替换镜像
sed -i 's_downloads.openwrt.org_mirrors.aliyun.com/openwrt_' /etc/opkg/distfeeds.conf

opkg install fdisk
fdisk -l
# F查看剩余空间 n创建新分区
fdisk /dev/sda
fdisk -l
# 为新创建的分区格式化文件系统为ext4
mkfs.ext4 /dev/sda3

opkg install block-mount

```

# 4 reference {#reference}

1. `toh-online` : <https://toh.openwrt.org/>
2. `toh-online-json` : <https://openwrt.org/toh.json>
3. `toh-home` : <https://openwrt.org/toh/views/start>
4. `supported_devices` : <https://openwrt.org/supported_devices>
5. `local_token`: <http://hiwifi.com/local-ssh>
6. `uuid`: <http://hiwifi.com/cgi-bin/turbo/proxy/router_info>
7. `ssh`: <http://www.hiwifi.wtf>
8. aliyun-mirrors :<https://mirrors.aliyun.com/openwrt/releases/22.03.2/targets/ramips/mt7621>


[^breed]:breed官网：<https://breed.hackpascal.net>
[^openwrt]:openwrt：<https://openwrt.org/toh/views/toh_fwdownload> <https://openwrt.org/docs/guide-user/start#installation>
[^openwrt-v2ray]:openwrt-v2ray项目地址：<https://github.com/kuoruan/openwrt-v2ray/>


