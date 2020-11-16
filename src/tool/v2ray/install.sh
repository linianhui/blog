# wget https://linianhui.github.io/tool/v2ray/install.sh
# 把0.0.0.0换成服务器IP
# bash install.sh '0.0.0.0'

set -eux

yum install -y wget gettext lsof

bash <(wget -q -O - https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh)

UUID=$(v2ctl uuid)
CRET_NAME=${UUID:0:8}
CRET_ORG=${UUID:9:4}

export TEMPLATE_SERVER_IP=$1
export TEMPLATE_SERVER_DOMAIN_NAME="${UUID:24:12}.test"
export TEMPLATE_CLIENT_ID=$UUID
export TEMPLATE_CERTIFICATE_JSON=$(v2ctl cert --ca --json --domain=$TEMPLATE_SERVER_DOMAIN_NAME --expire=24000h --name=$CRET_NAME --org=$CRET_ORG)

wget -q https://linianhui.github.io/tool/v2ray/v2ray.service -O /etc/systemd/system/v2ray.service

wget -q -O - https://linianhui.github.io/tool/v2ray/server-config.template.json | envsubst > /etc/v2ray.json

wget -q -O - https://linianhui.github.io/tool/v2ray/client-config.template.json | envsubst > client-config.json

echo "vmess://$(wget -q -O - https://linianhui.github.io/tool/v2ray/client-config.v2rayng.template.json | envsubst | base64 -w 0)" > client-config.v2rayng.json

systemctl daemon-reload
systemctl enable v2ray
systemctl restart v2ray
systemctl status v2ray

lsof -i:443

# https://github.com/v2fly/v2ray-core

# https://github.com/gfwlist/gfwlist
# https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
