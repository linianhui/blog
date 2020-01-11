---
title: '[Android] 工具'
created_at: 2020-01-11 12:44:01
tag: ["android","adb","fastboot","wlan"]
toc: true
---

# 1 Platform Tools {#1-platform-tools}

1. help : <https://developer.android.com/studio/releases/platform-tools.html>
2. windows : <https://dl.google.com/android/repository/platform-tools-latest-windows.zip>
3. windows usb driver: <https://developer.android.com/studio/run/win-usb>

# 2 adb {#2-adb}

```cmd
adb reboot bootloader
adb reboot recovery
adb sideload rom.zip
adb push rom.zip /sdcard/0/
```

# 3 fastboot {#3-fastboot}

```cmd
fastboot flash recovery recovery.img
fastboot flash logo logo.bin
```

# 4 WLAN captive {#4-wlan-captive}

```sh
# 7.0
settings put global captive_portal_server captive.v2ex.co

# 7.1+
settings put global captive_portal_https_url https://captive.v2ex.co/generate_204
```
