---
title: '[Android] 工具'
created_at: 2018-05-17 23:48:01
tag: ["android","adb","fastboot","wlan"]
toc: true
---

# 1 Platform Tools {#1-platform-tools}

<https://developer.android.com/studio/releases/platform-tools>


## 1.1 Download {#1-1-download}

| platform | url                                                                          |
| :------- | :--------------------------------------------------------------------------- |
| Windows  | <https://dl.google.com/android/repository/platform-tools-latest-windows.zip> |
| macOS    | <https://dl.google.com/android/repository/platform-tools-latest-darwin.zip>  |
| Linux    | <https://dl.google.com/android/repository/platform-tools-latest-linux.zip>   |

## 1.2 USB Driver {#1-2-usb-driver}


| platform          | url                                                                   |
| :---------------- | :-------------------------------------------------------------------- |
| OEM USE Drivers   | <https://developer.android.com/studio/run/oem-usb>                    |
| Google USB Driver | <https://developer.android.com/studio/run/win-usb>                    |
|                   | <https://dl.google.com/android/repository/usb_driver_r12-windows.zip> |


# 2 adb {#2-adb}

```bash
adb reboot bootloader
adb reboot recovery
adb sideload rom.zip
adb push rom.zip /sdcard/0/
```

# 3 fastboot {#3-fastboot}

```shbash
fastboot flash recovery recovery.img
fastboot flash logo logo.bin
```

# 4 WLAN captive {#4-wlan-captive}

```bash
# 7.0
settings put global captive_portal_server captive.v2ex.co

# 7.1+
settings put global captive_portal_https_url https://captive.v2ex.co/generate_204
```
