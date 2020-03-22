# wget https://linianhui.github.io/linux/ubuntu/dde.install.sh
# sudo bash ubuntu.dde.install.sh

set -eux

# 1. 添加 PPA Repository https://launchpad.net/~leaeasy/+archive/ubuntu/dde
add-apt-repository ppa:leaeasy/dde

# 2. 安装
apt install -y dde dde-file-manager deepin-icon-theme

# 3. 启动
lightdm start
