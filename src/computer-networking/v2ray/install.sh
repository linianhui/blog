# wget https://linianhui.github.io/computer-networking/v2ray/install.sh
# bash install.sh domain1.test $(cat /proc/sys/kernel/random/uuid)

set -eux

bash <(wget -O - https://install.direct/go.sh)

apt install gettext-base

export TEMPLATE_DOMAIN_NAME=$1
export TEMPLATE_CLIENT_ID=$2
export TEMPLATE_CERTIFICATE_JSON=$(/usr/bin/v2ray/v2ctl cert --ca -json --domain=$TEMPLATE_DOMAIN_NAME --expire=24000h --name=name --org=org)

wget https://linianhui.github.io/computer-networking/v2ray/server-config.template.json -O server-config.template.json
envsubst < server-config.template.json > /etc/v2ray/config.json

wget https://linianhui.github.io/computer-networking/v2ray/client-config.template.json -O client-config.template.json
envsubst < client-config.template.json > client-config.json

service v2ray restart
service v2ray status

lsof -i:443

# https://github.com/v2ray/v2ray-core
# https://github.com/v2ray/manual/blob/master/zh_cn/SUMMARY.md

# https://github.com/gfwlist/gfwlist
# https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
