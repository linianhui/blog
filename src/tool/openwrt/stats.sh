opkg update

opkg install luci-app-statistics

# 查询支持的监控模块
# opkg list | grep collectd-mod | sort

opkg install collectd-mod-cpu
opkg install collectd-mod-df
opkg install collectd-mod-disk
opkg install collectd-mod-load
opkg install collectd-mod-ipstatistics
#opkg install collectd-mod-iptables
opkg install collectd-mod-memory
opkg install collectd-mod-network
opkg install collectd-mod-ping
#opkg install collectd-mod-protocols
/etc/init.d/collectd enable