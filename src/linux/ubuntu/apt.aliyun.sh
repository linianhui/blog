# sudo bash <(wget -q -O - https://linianhui.github.io/linux/ubuntu/apt.aliyun.sh)

set -eux

cat /etc/apt/sources.list

cp /etc/apt/sources.list /etc/apt/sources.list.bak

wget -O /etc/apt/sources.list https://linianhui.github.io/linux/ubuntu/sources-$(lsb_release -cs).list

cat /etc/apt/sources.list
