# wget https://linianhui.github.io/computer-networking/v2ray/install.sh
# bash install.sh '0.0.0.0' '0.0.0.0' 'domain1.test' $(cat /proc/sys/kernel/random/uuid)

set -eux

apt install -y wget gettext-base

bash <(wget -q -O - https://install.direct/go.sh)

export TEMPLATE_SERVER_LISTEN_IP=$1
export TEMPLATE_SERVER_IP=$2
export TEMPLATE_SERVER_NAME=$3
export TEMPLATE_CLIENT_ID=$4
export TEMPLATE_CERTIFICATE_JSON=$(/usr/bin/v2ray/v2ctl cert -json --domain=$TEMPLATE_SERVER_NAME --expire=24000h --name=name.test --org=org.test)

wget -q -O - https://linianhui.github.io/computer-networking/v2ray/server-config.template.json | envsubst > /etc/v2ray/config.json

wget -q -O - https://linianhui.github.io/computer-networking/v2ray/client-config.template.json | envsubst > client-config.json

service v2ray restart
service v2ray status

lsof -i:443

# https://github.com/v2ray/v2ray-core
# https://github.com/v2ray/manual/blob/master/zh_cn/SUMMARY.md

# https://github.com/gfwlist/gfwlist
# https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
