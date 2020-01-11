# wget https://linianhui.github.io/docker/install/config.dockerd.sh
# sudo bash config.dockerd.sh

set -eux
# https://docs.docker.com/engine/reference/commandline/dockerd//#daemon-configuration-file

wget https://linianhui.github.io/docker/install/daemon.json -O daemon.json

cp daemon.json /etc/docker/

cat /etc/docker/daemon.json

systemctl daemon-reload
systemctl restart docker

docker info