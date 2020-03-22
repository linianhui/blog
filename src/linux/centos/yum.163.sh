# wget https://linianhui.github.io/linux/centos/yum.163.sh
# sudo bash centos.yum.163.sh

set -eux

cat /etc/yum.repos.d/CentOS-Base.repo

mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.bak

curl -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.163.com/.help/CentOS7-Base-163.repo

cat /etc/yum.repos.d/CentOS-Base.repo
