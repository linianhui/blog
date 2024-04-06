# wget https://linianhui.github.io/tool/v2ray/install.sh
# sudo bash install.sh 127.0.0.1

set -eux
V2RAY_VERSION=5.14.1
export V2RAY_SERVER_IP=$1

apt install -y wget gettext lsof

bash <(wget -q -O - https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh) --version $V2RAY_VERSION

/usr/local/bin/v2ray version

UUID=$(/usr/local/bin/v2ray uuid)
CRET_NAME=${UUID:0:8}
CRET_ORG=${UUID:9:4}

export TEMPLATE_SERVER_DOMAIN_NAME="${UUID:14:4}.test"
export TEMPLATE_CLIENT_ID=$UUID
export TEMPLATE_CERTIFICATE_JSON=$(/usr/local/bin/v2ray tls cert --ca --json --domain=$TEMPLATE_SERVER_DOMAIN_NAME --expire=720 --name=$CRET_NAME --org=$CRET_ORG)

wget -q -O - https://linianhui.github.io/tool/v2ray/server-config.template.json | envsubst > /usr/local/etc/v2ray/config.json

/usr/local/bin/v2ray test -c /usr/local/etc/v2ray/config.json

wget -q -O - https://linianhui.github.io/tool/v2ray/client-config.template.json | envsubst > client-config.json

echo "vmess://$(wget -q -O - https://linianhui.github.io/tool/v2ray/client-config.v2rayng.template.json | envsubst | base64 -w 0)" > client-config.v2rayng.json

setcap cap_net_bind_service=+ep /usr/local/bin/v2ray

systemctl daemon-reload
systemctl enable v2ray
systemctl restart v2ray
systemctl status v2ray

lsof -i:443

# https://github.com/v2fly/v2ray-core

# https://github.com/gfwlist/gfwlist
# https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt
