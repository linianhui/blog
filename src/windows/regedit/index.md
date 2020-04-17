---
title: '[Windows] regedit'
created_at: 2017-07-29 09:42:01
tag: ["Windows", "regedit"]
toc: true
---


# 1 regedit.exe {#1-regedit-exe}
注册表是Windows中的一个非常重要的数据库，用于存储系统和应用程序的设置信息。`regedit.exe`(Registry Editor)是Windows的注册表编辑器。

位于 : `%systemroot%\regedit.exe`

# 2 `*.reg`文件格式 {#2-reg-file-spec}

1. 文件扩展名 : `.reg`。
2. 编码方式 : `UTF-16 LE`。
3. 换行 : `CRLF`。
4. 注释 : `;`。
5. 删除 : `-`。

# 3 列表 {#3-reg-file-list}

{{<file-list title="reg文件列表"  regex="^.*\.reg$">}}
