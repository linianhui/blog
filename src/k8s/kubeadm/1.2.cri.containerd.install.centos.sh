# https://kubernetes.io/docs/setup/production-environment/container-runtimes/#containerd

set -eux

yum install -y yum-utils device-mapper-persistent-data lvm2


yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo


yum update -y && yum install -y containerd.io


mkdir -p /etc/containerd
containerd config default > /etc/containerd/config.toml
cat /etc/containerd/config.toml


systemctl restart containerd