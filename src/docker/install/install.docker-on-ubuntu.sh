# wget https://linianhui.github.io/docker/install/install.docker-on-ubuntu.sh
# sudo bash install.docker-on-ubuntu.sh

set -eux

apt-get remove -y \
        docker \
        docker-engine \
        docker.io

apt-get update -y

apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        software-properties-common

curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | apt-key add -

apt-key fingerprint 0EBFCD88

add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"

apt-get update -y
apt-get install -y docker-ce

groupadd docker
usermod -aG docker lnh

systemctl enable docker

docker version

docker run hello-world