# wget https://linianhui.github.io/computer-networking/v2ray/install.sh
# 把0.0.0.0换成服务器IP
# bash install.sh '0.0.0.0'

set -eux

apt install -y wget gettext-base

bash <(wget -q -O - https://install.direct/go.sh)

CRET_NAME=$(/usr/bin/v2ray/v2ctl uuid)
CRET_ORG=$(/usr/bin/v2ray/v2ctl uuid)

export TEMPLATE_SERVER_IP=$1
export TEMPLATE_SERVER_DOMAIN_NAME="$(/usr/bin/v2ray/v2ctl uuid).test"
export TEMPLATE_CLIENT_ID=$(/usr/bin/v2ray/v2ctl uuid)
export TEMPLATE_CERTIFICATE_JSON=$(/usr/bin/v2ray/v2ctl cert --ca --json --domain=$TEMPLATE_SERVER_DOMAIN_NAME --expire=24000h --name=$CRET_NAME --org=$CRET_ORG)

wget -q -O - https://linianhui.github.io/computer-networking/v2ray/server-config.template.json | envsubst > /etc/v2ray/config.json

wget -q -O - https://linianhui.github.io/computer-networking/v2ray/client-config.template.json | envsubst > client-config.json

echo "vmess://$(wget -q -O - https://linianhui.github.io/computer-networking/v2ray/client-config.v2rayng.template.json | envsubst | base64 -w 0)" > client-config.v2rayng.json

service v2ray restart
service v2ray status

lsof -i:443

# https://github.com/v2ray/v2ray-core
# https://github.com/v2ray/manual/blob/master/zh_cn/SUMMARY.md

# https://github.com/gfwlist/gfwlist
# https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
