# sudo bash <(wget -q -O - https://linianhui.github.io/linux/debian/init.sh)

set -x

apt update \
    && apt -y install sudo vim curl wget unzip tcpdump net-tools iproute2 vim jq coreutils tini gdisk apt-transport-https ca-certificates software-properties-common gnupg1 gnupg2\
    && apt -y autoremove \
    && apt -y clean

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
# https://unix.stackexchange.com/questions/671940/disabling-swap-on-debian-permanently
# https://wiki.archlinux.org/title/swap#Disabling_swap
systemctl --type swap
systemctl mask dev-sdb3.swap


# 永久禁用SELINUX
tee <<-EOF /etc/selinux/config
SELINUX=disabled
EOF

# mount disk

# fdisk -l
# mount -l

# fdisk /dev/sdb
# mkfs.ext4 -G 4096 /dev/sdb1
# 挂载 /etc/fstab
# 查看uuid blkid
# UUID=6ee00141-8904-4734-8096-d95bf7ac645f /data ext4 defaults 0 0
