# wget https://linianhui.github.io/linux/ubuntu/apt.aliyun.sh
# sudo bash ubuntu.apt.aliyun.sh
# sh -c "$(curl -fsSL https://linianhui.github.io/linux/ubuntu/apt.aliyun.sh)"

set -eux

cat /etc/apt/sources.list

cp /etc/apt/sources.list /etc/apt/sources.list.bak

sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list

cat /etc/apt/sources.list
