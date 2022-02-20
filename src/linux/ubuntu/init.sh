# sudo bash <(wget -q -O - https://linianhui.github.io/linux/ubuntu/init.sh)

set -x

apt-get update \
    && apt-get -y install curl wget unzip tcpdump net-tools iproute2 vim jq coreutils tini\
    && apt-get -y autoremove \
    && apt-get -y clean

# 禁用防火墙
# ubuntu
ufw disable
# centos
systemctl stop firewalld
systemctl disable firewalld


# 禁用swap
sudo swapoff -a
# 永久禁用swap
cat /etc/fstab
cat /etc/fstab | grep -v swap > /etc/fstab
cat /etc/fstab


# 永久禁用SELINUX
tee <<-EOF /etc/selinux/config
SELINUX=disabled
EOF

# 禁用snap

# umount /snap/core* -lf
# snap remove core
# snap remove core18
# snap remove core20
# snap remove snapd
# snap remove snapd
# apt remove snapd --purge -y

# mount disk

# fdisk -l
# mount -l

# fdisk /dev/sdb
# mkfs -t xfs /dev/sdb1
# ls -l /dev/disk/by-uuid
# /dev/disk/by-uuid/8249b2b1-fa51-4e95-8639-94b749b865ec /data xfs defaults 0 0
