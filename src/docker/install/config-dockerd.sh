# wget https://linianhui.github.io/docker/install/config-dockerd.sh
# sudo bash config-dockerd.sh

set -eux
# https://docs.docker.com/engine/reference/commandline/dockerd//#daemon-configuration-file

mkdir /etc/docker

wget -O /etc/docker/daemon.json https://linianhui.github.io/docker/install/daemon.json

cat /etc/docker/daemon.json

systemctl daemon-reload
systemctl restart docker

docker info
