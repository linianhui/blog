#!/bin/bash

# sudo bash install.sh 127.0.0.1 127.0.0.1

# https://github.com/v2fly/v2ray-core
# https://github.com/gfwlist/gfwlist
# https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt

set -eux
V2RAY_VERSION=5.14.1
export V2RAY_SERVER_IP=${1:-127.0.0.1}
export V2RAY_CLIENT_IP=${2:-127.0.0.1}

apt update -y
apt install -y wget gettext lsof net-tools

bash <(wget -q -O - https://raw.githubusercontent.com/v2fly/fhs-install-v2ray/master/install-release.sh) --version $V2RAY_VERSION

/usr/local/bin/v2ray version

UUID=$(/usr/local/bin/v2ray uuid)
CRET_NAME=${UUID:0:8}
CRET_ORG=${UUID:9:4}

export TEMPLATE_SERVER_DOMAIN_NAME="${UUID:14:4}.test"
export TEMPLATE_CLIENT_ID=$UUID
export TEMPLATE_CERTIFICATE_JSON=$(/usr/local/bin/v2ray tls cert --ca --json --domain=$TEMPLATE_SERVER_DOMAIN_NAME --expire=720 --name=$CRET_NAME --org=$CRET_ORG)

SERVER_JSON_TEMPLATE=$(cat <<'SERVER_JSON'
{
  "log": {
    "logLevel": "None"
  },
  "inbounds": [
    {
      "listen": "${V2RAY_SERVER_IP}",
      "port": 443,
      "protocol": "vless",
      "settings": {
        "decryption": "none",
        "clients": [
          {
            "id": "${TEMPLATE_CLIENT_ID}"
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "tls",
        "tlsSettings": {
          "serverName": "${TEMPLATE_SERVER_DOMAIN_NAME}",
          "allowInsecure": false,
          "allowInsecureCiphers": false,
          "disableSystemRoot": true,
          "certificates": [
            ${TEMPLATE_CERTIFICATE_JSON}
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    }
  ]
}
SERVER_JSON
)

echo "${SERVER_JSON_TEMPLATE}" | envsubst > /usr/local/etc/v2ray/config.json

/usr/local/bin/v2ray test -c /usr/local/etc/v2ray/config.json

CLIENT_JSON_TEMPLATE=$(cat <<'CLIENT_JSON'
{
  "log": {
    "logLevel": "None"
  },
  "inbounds": [
    {
      "listen": "$V2RAY_CLIENT_IP",
      "port": 1080,
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": true
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "${V2RAY_SERVER_IP}",
            "port": 443,
            "users": [
              {
                "id": "${TEMPLATE_CLIENT_ID}",
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "tls",
        "tlsSettings": {
          "serverName": "${TEMPLATE_SERVER_DOMAIN_NAME}",
          "allowInsecure": false,
          "allowInsecureCiphers": false,
          "disableSystemRoot": true,
          "certificates": [
            ${TEMPLATE_CERTIFICATE_JSON}
          ]
        }
      },
      "mux": {
        "enabled": false
      }
    },
    {
      "protocol": "freedom",
      "settings": {},
      "mux": {
        "enabled": false
      }
    }
  ]
}
CLIENT_JSON
)

echo "${CLIENT_JSON_TEMPLATE}" | envsubst > v2ray-client-config.json

setcap cap_net_bind_service=+ep /usr/local/bin/v2ray

systemctl daemon-reload
systemctl enable v2ray
systemctl restart v2ray
systemctl status v2ray

lsof -i:443
netstat -an | grep 443