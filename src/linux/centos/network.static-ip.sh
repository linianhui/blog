# wget https://linianhui.github.io/linux/centos/network.static-ip.sh
# sudo bash centos.network.static-ip.sh 202

set -eux

IP=$1

ip a

cat /etc/sysconfig/network-scripts/ifcfg-eth0

cat <<-EOF > /etc/sysconfig/network-scripts/ifcfg-eth0
# systemctl restart network
TYPE=Ethernet
NAME=eth0
DEVICE=eth0
ONBOOT=yes
BOOTPROTO=static
IPADDR=192.168.2.$IP
NETMASK=255.255.255.0
GATEWAY=192.168.2.1
PROXY_METHOD=none
BROWSER_ONLY=no
DEFROUTE=yes
IPV4_FAILURE_FATAL=yes
EOF

cat /etc/sysconfig/network-scripts/ifcfg-eth0


cat /etc/sysconfig/network

cat <<-EOF > /etc/sysconfig/network
# systemctl restart network
NETWORKING=yes
GATEWAY=192.168.2.1
DNS1=192.168.2.1
EOF

cat /etc/sysconfig/network

systemctl restart network

ip a
