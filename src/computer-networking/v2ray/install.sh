# wget https://linianhui.github.io/computer-networking/v2ray/install.sh
# bash install.sh

set -eux

bash <(wget -O - https://install.direct/go.sh)

apt install gettext-base

export PATH=$PATH:/usr/bin/v2ray/
export SERVER_NAME=domain.test
export UUID=$(v2ctl uuid)
export CERTIFICATE_JSON=$(v2ctl cert --ca --domain=$SERVER_NAME --expire=24000h --name=$SERVER_NAME --org=$SERVER_NAME)

wget https://linianhui.github.io/computer-networking/v2ray/server-config.template.json -O server-config.template.json
envsubst < server-config.template.json > /etc/v2ray/config.json

wget https://linianhui.github.io/computer-networking/v2ray/client-config.template.json -O client-config.template.json
envsubst < client-config.template.json > client-config.json

service v2ray stop
service v2ray start
service v2ray status

lsof -i:443
