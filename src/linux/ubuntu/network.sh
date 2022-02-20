# sudo bash <(wget -q -O - https://linianhui.github.io/linux/ubuntu/network.sh)

set -eux

CONFIG_FILE="/etc/netplan/$(ls /etc/netplan)"

cat $CONFIG_FILE
cp $CONFIG_FILE $CONFIG_FILE.bak

ip a

wget -O $CONFIG_FILE https://linianhui.github.io/linux/ubuntu/network.yaml

cat $CONFIG_FILE

netplan apply

ip a
