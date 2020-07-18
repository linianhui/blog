set -eux


apt-get update -y
apt-get install -y apt-transport-https


curl -fsSL https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | apt-key add -


tee <<-EOF /etc/apt/sources.list.d/kubernetes.list
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
EOF


apt-get update -y
# 安装kubeadm kubelet kubectl
apt-get install -y kubeadm-1.18.3 kubelet-1.18.3 kubectl-1.18.3
