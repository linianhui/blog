---
title: '[Linux] Ubuntu'
created_at: 2018-12-12 23:21:01
tag: ["Linux", "Ubuntu"]
toc: true
---

# 1 Install {#install}

| iso      | url                                                                       |
| -------- | ------------------------------------------------------------------------- |
| official | http://releases.ubuntu.com                                                |
| 163      | http://mirrors.163.com/ubuntu-releases                                    |
| aliyun   | https://mirrors.aliyun.com/ubuntu-releases                                |
| legacy   | https://mirrors.tuna.tsinghua.edu.cn/ubuntu-cdimage/ubuntu-legacy-server/ |
| vm       | http://cloud-images.ubuntu.com/bionic/current                             |


| source | url                                               |
| ------ | ------------------------------------------------- |
| 163    | http://mirrors.163.com/.help/ubuntu.html          |
| aliyun | http://mirrors.aliyun.com/ubuntu/                 |
| dde    | https://www.deepin.org/original/deepin-boot-maker |

# 2 Config {#config}

```sh
sudo passwd root
# /etc/ssh/sshd_cofig 
# PermitRootLogin yes
apt-get -y autoremove clean
```

```sh
Optimize-VHD -Path E:\_vhd\ubts.vhdx -Mode Full
```

```sh
# 查看硬盘
fdisk -l

# 创建新分区 n w
gdisk /dev/sdb

# 格式化新分区
mkfs.ext4 /dev/sdb1

# 挂载 /etc/fstab
# 查看uuid
blkid
# UUID=f1abf791-fe61-4dab-858f-632acb7d1d8f /data  ext4  defaults 0 0

```

# 3 Reference {#reference}

{{<highlight-file path="network.yaml" lang="yaml">}}

{{<highlight-file path="sources-focal.list" lang="list">}}

{{<highlight-file path="init.sh" lang="sh">}}
