---
title: '[Linux] Debian'
created_at: 2023-08-06 01:18:18
tag: ["Linux", "Debian"]
toc: true
---

# 1 Install {#install}

| iso                | url                                                            |
| ------------------ | -------------------------------------------------------------- |
| official           | https://www.debian.org/distrib/                                |
| 163                | http://mirrors.163.com/debian-cd/                              |
| aliyun             | https://mirrors.aliyun.com/debian-cd/                          |
| old                | https://cdimage.debian.org/mirror/cdimage/archive/             |
| Installation Guide | https://www.debian.org/releases/stable/amd64/install.zh-cn.pdf |


| source | url                                        |
| ------ | ------------------------------------------ |
| 163    | http://mirrors.163.com/.help/debian.html   |
| aliyun | https://developer.aliyun.com/mirror/debian |

# 2 Config {#config}

```sh
sudo passwd root
# /etc/ssh/sshd_cofig 
# PermitRootLogin yes
apt-get -y autoremove clean
```

```sh
Optimize-VHD -Path E:\_vhd\deb1.vhdx -Mode Full
```

```sh
# 更改主机名
# /etc/hostname
# /etc/hosts

# 查看硬盘
fdisk -l

# 创建新分区 n w
gdisk /dev/sdb

# 格式化新分区
mkfs.xfs /dev/sdb1

# 挂载 /etc/fstab
# 查看uuid
blkid
# UUID=6ee00141-8904-4734-8096-d95bf7ac645f /data  ext4  defaults 0 0

```

# 3 Reference {#reference}

{{<highlight-file path="sysctl.conf" lang="ini">}}

{{<highlight-file path="interfaces" lang="ini">}}

{{<highlight-file path="sources-bullseye.list" lang="list">}}

{{<highlight-file path="init.sh" lang="sh">}}
