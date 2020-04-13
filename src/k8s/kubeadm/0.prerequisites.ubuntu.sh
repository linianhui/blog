set -eux


# 禁用防火墙
ufw disable


# 禁用SWAP
# 永久禁用
cat /etc/fstab
cat /etc/fstab | grep -v swap > /etc/fstab
cat /etc/fstab


# 禁用SELINUX
# 永久禁用
tee <<-EOF /etc/selinux/config
SELINUX=permissive
EOF