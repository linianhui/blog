# sudo bash <(wget -q -O - https://linianhui.github.io/linux/debian/init.sh)

set -x

apt-get update \
    && apt-get -y install curl wget unzip tcpdump net-tools iproute2 vim jq coreutils tini gdisk\
    && apt-get -y autoremove \
    && apt-get -y clean

# 禁用防火墙
# debian
ufw disable
# centos
systemctl stop firewalld
systemctl disable firewalld


# 禁用swap
swapoff -a
# 永久禁用swap
cat /etc/fstab
cat /etc/fstab | grep -v swap > /etc/fstab
cat /etc/fstab


# 永久禁用SELINUX
tee <<-EOF /etc/selinux/config
SELINUX=disabled
EOF

# mount disk

# fdisk -l
# mount -l

# fdisk /dev/sdb
# mkfs -t ext4 /dev/sdb1
# 挂载 /etc/fstab
# 查看uuid blkid
# UUID=6ee00141-8904-4734-8096-d95bf7ac645f /data ext4 defaults 0 0
