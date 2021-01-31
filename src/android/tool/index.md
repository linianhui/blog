---
title: '[Android] 工具'
created_at: 2018-05-17 23:48:01
tag: ["android","adb","fastboot","wlan"]
toc: true
---

# 1 Download {#download}
## 1.1 Factory Image {#factory-image}

<https://developers.google.com/android/images#ryu>

## 1.2 Platform Tools {#platform-tools}

| platform | url                                                                          |
| :------- | :--------------------------------------------------------------------------- |
| Windows  | <https://dl.google.com/android/repository/platform-tools-latest-windows.zip> |
| macOS    | <https://dl.google.com/android/repository/platform-tools-latest-darwin.zip>  |
| Linux    | <https://dl.google.com/android/repository/platform-tools-latest-linux.zip>   |

> <https://developer.android.com/studio/releases/platform-tools>
## 1.3 Driver {#driver}

| platform          | url                                                                   |
| :---------------- | :-------------------------------------------------------------------- |
| OEM USE Drivers   | <https://developer.android.com/studio/run/oem-usb>                    |
| Google USB Driver | <https://developer.android.com/studio/run/win-usb>                    |
|                   | <https://dl.google.com/android/repository/usb_driver_r12-windows.zip> |


## 1.4 Recovery {#recovery}


TWRP: <https://twrp.me/Devices/>

# 2 Command {#command}

## 2.1 fastboot {#fastboot}

```bash
fastboot flashing unlock
# fix fastboot error ：unsupported command 
fwtool vbnv write dev_boot_fastboot_full_cap 1
fastboot flash recovery recovery.img
fastboot flash logo logo.bin
```

## 2.2 adb {#adb}

```bash
adb reboot bootloader
adb reboot recovery
adb sideload rom.zip
adb push rom.zip /sdcard/0/
```

# 3 WLAN captive {#wlan-captive}

```bash
# 7.0
settings put global captive_portal_server captive.v2ex.co

# 7.1+
settings put global captive_portal_https_url https://captive.v2ex.co/generate_204
```
