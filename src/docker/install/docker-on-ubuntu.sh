# wget https://linianhui.github.io/docker/install/docker-on-ubuntu.sh
# sudo bash install.docker-on-ubuntu.sh

set -eux

apt remove -y docker docker-engine docker.io

apt update -y

apt install -y apt-transport-https ca-certificates curl software-properties-common

curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | apt-key add -

apt-key fingerprint 0EBFCD88

add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"

apt update -y
apt install -y docker-ce

groupadd docker

systemctl enable docker

docker version
