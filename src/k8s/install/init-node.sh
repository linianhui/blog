# https://kubernetes.io/docs/setup/production-environment/container-runtimes/#containerd

set -x

cat <<-EOF >> /etc/hosts
192.168.2.211 api-server.k8s.test
EOF

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

# 开启overlay和br_netfilter模块
cat <<-EOF > /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
modprobe overlay
modprobe br_netfilter

# 开启ipv4 forward
cat <<-EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
EOF
sysctl --system
