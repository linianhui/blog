# wget https://linianhui.github.io/docker/install/install.docker-compose.sh
# sudo bash install.docker-compose.sh

set -eux

curl -L https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m) \
     -o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose

docker-compose --version
