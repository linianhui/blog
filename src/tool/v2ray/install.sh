# wget https://linianhui.github.io/tool/v2ray/install.sh
# 把0.0.0.0换成服务器IP
# bash install.sh '0.0.0.0'

set -eux

yum install -y wget gettext

bash <(wget -q -O - https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)

CRET_NAME=$(v2ctl uuid)
CRET_ORG=$(v2ctl uuid)

export TEMPLATE_SERVER_IP=$1
export TEMPLATE_SERVER_DOMAIN_NAME="$(v2ctl uuid).test"
export TEMPLATE_CLIENT_ID=$(v2ctl uuid)
export TEMPLATE_CERTIFICATE_JSON=$(v2ctl cert --ca --json --domain=$TEMPLATE_SERVER_DOMAIN_NAME --expire=24000h --name=$CRET_NAME --org=$CRET_ORG)

wget -q -O - https://linianhui.github.io/tool/v2ray/server-config.template.json | envsubst > /usr/local/etc/v2ray/config.json

wget -q -O - https://linianhui.github.io/tool/v2ray/client-config.template.json | envsubst > client-config.json

echo "vmess://$(wget -q -O - https://linianhui.github.io/tool/v2ray/client-config.v2rayng.template.json | envsubst | base64 -w 0)" > client-config.v2rayng.json

systemctl enable v2ray
systemctl restart v2ray
systemctl status v2ray

lsof -i:443

# https://github.com/v2fly/v2ray-core

# https://github.com/gfwlist/gfwlist
# https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
