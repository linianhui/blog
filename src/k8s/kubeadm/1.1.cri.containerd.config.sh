# https://kubernetes.io/docs/setup/production-environment/container-runtimes/#containerd

set -eux


cat /etc/modules-load.d/containerd.conf
cat <<-EOF > /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF
cat /etc/modules-load.d/containerd.conf


modprobe overlay
modprobe br_netfilter


cat /etc/sysctl.d/99-kubernetes-cri.conf
cat <<-EOF > /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF
cat /etc/sysctl.d/99-kubernetes-cri.conf


sysctl --system