# wget https://linianhui.github.io/docker/install/docker-on-debian.sh
# sudo bash install.docker-on-debian.sh

set -eux

apt remove -y docker docker-engine docker.io

apt update -y

apt install -y apt-transport-https ca-certificates curl software-properties-common gnupg1 gnupg2

curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/debian/gpg | apt-key add -

add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/debian $(lsb_release -cs) stable"

apt update -y
apt install -y docker-ce

groupadd docker

systemctl enable docker

docker version
