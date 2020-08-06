---
title: "[工具] v2ray"
created_at: 2020-02-13 08:01:00
toc: true
---

# 1 服务器安装 {#server-install}

{{<highlight-file file="install.sh" lang="sh">}}

# 2 客户端安装 {#client-install}

## 2.1 Windows {#client-install-windows}

下载客户端<https://github.com/v2ray/v2ray-core/releases/download/v4.24.2/v2ray-windows-64.zip>。

然后用[服务器安装](#server-install)中生成的`client-config.json`替换zip解压后的`config.json`即可。

## 2.2 macOS {#client-install-macos}

下载客户端<https://github.com/v2ray/v2ray-core/releases/download/v4.24.2/v2ray-macos.zip>。

然后用[服务器安装](#server-install)中生成的`client-config.json`替换zip解压后的`config.json`即可。

## 2.3 Andorid {#client-install-android}

下载APK<https://github.com/2dust/v2rayNG/releases>。

然后用[服务器安装](#server-install)中生成的`client-config.v2rayng.json`复制到剪切板或者生成二维码。用v2rayNG这个APP从剪切板导入或者扫描二维码都可以。

# 3 浏览器扩展 {#browser-extensions}

SwitchyOmega : <https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif>


# 4 参考 {#reference}

## 4.1 服务器配置模板 {#server-config-template}

{{<highlight-file file="server-config.template.json" lang="json">}}

## 4.2 客户端配置模板(v2ray-core) {#client-config-template}

{{<highlight-file file="client-config.template.json" lang="json">}}

## 4.3 客户端配置模板(v2rayNG) {#client-config-v2rayng-template}

{{<highlight-file file="client-config.v2rayng.template.json" lang="json">}}