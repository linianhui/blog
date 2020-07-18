# wget https://linianhui.github.io/docker/install/docker-on-centos.sh
# sudo bash install.docker-on-centos.sh

set -eux

yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-selinux docker-engine-selinux docker-engine

yum install -y yum-utils device-mapper-persistent-data lvm2

yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

yum install -y docker-ce

groupadd docker

systemctl enable docker

docker version