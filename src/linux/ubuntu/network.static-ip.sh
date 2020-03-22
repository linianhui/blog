# wget https://linianhui.github.io/linux/ubuntu/network.static-ip.sh
# sudo bash ubuntu.network.static-ip.sh 201

set -eux

IP=$1

ip a

cat /etc/netplan/50-cloud-init.yaml

cat <<-EOF > /etc/netplan/50-cloud-init.yaml
# https://netplan.io/examples
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      addresses:
        - 192.168.2.$IP/24
      dhcp4: no
      dhcp6: no
      gateway4: 192.168.2.1
      nameservers:
        addresses:
          - 192.168.2.1
EOF

cat /etc/netplan/50-cloud-init.yaml

netplan apply

ip a
