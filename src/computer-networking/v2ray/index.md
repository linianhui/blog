---
title: "[计算机网络] v2ray"
created_at: 2020-02-13 08:01:00
toc: true
---

# 1 安装脚本 {#1-install-script}

此脚本会自动生成自签名的证书以及服务端和客户端的配置(配置文件中已内嵌自动生成的证书)。使用wget下载sh脚本，然后执行(可以通过参数自定义配置)即可。

{{<highlight-file file="install.sh" lang="sh">}}

# 2 服务端配置 {#2-server-config}

{{<highlight-file file="server-config.template.json" lang="json">}}

# 3 客户端配置 {#3-client-config}

{{<highlight-file file="client-config.template.json" lang="json">}}

# 4 SwitchyOmega {#4-switchyomega}

<https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif>

