---
title: '[Windows] slmgr'
created_at: 2017-07-29 09:42:01
tag: ["Windows", "slmgr"]
toc: true
---

# 1 软件授权管理 {#1-slmgr-vbs}

`slmgr.vbs`(Software License Manager Script)是Windows Vista及后续版本中用来管理系统激活和密钥、证书的命令行工具。

## 1.2 OEM激活 {#1-1-oem-activate}

```powershell
# 安装 LENOVO 许可证
slmgr.vbs -ilc LENOVO.6K2KY-BFH24-PJW6W-9GK29-TMPWP.ABE28D29811D239567F522B6B99EA85EED911A90.XRM-MS

# 导入密钥
slmgr.vbs -ipk 6K2KY-BFH24-PJW6W-9GK29-TMPWP

# 查看激活状态
slmgr.vbs -dlv
```
# 2 列表 {#2-xrm-ms-file-list}

{{<file-list title="XRM-MS文件列表"  regex="^.*\.XRM-MS$">}}

# 3 路径 {#3-path}

`%systemroot%\system32\slmgr.vbs`

# 4 参考 {#4-reference}

https://technet.microsoft.com/en-us/library/ff793433.aspx

https://docs.microsoft.com/en-us/deployoffice/vlactivation/tools-to-manage-volume-activation-of-office
