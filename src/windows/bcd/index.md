---
title: '[Windows] bcd'
created_at: 2017-07-29 09:42:01
tag: ["Windows", "bcd", "bcdboot","bcdedit","bcdsect"]
toc: true
---

# 1 BCD {#1-bcd}

`BCD`=`Boot Configuration Data`。**BCD**文件是[Vista]引入的负责保存启动配置数据的文件，在NT60版本之前是使用boot.ini来保存启动配置数据。

## 1.2 编辑工具 {#1-1-bcd-edit-tool}

1. [bcdboot.exe] : 简易。
2. [bcdedit.exe] : 功能全面。

**bcdboot.exe** 和 **bcdedit.exe**很相似，但是也有如下差异 :
- **bcdboot.exe** : 侧重于为现有的Windows分区设置引导加载程序（准备安装的，已安装的或者基于VHD的）；通过将指定目录中存在的一些文件复制到指定的位置并更新主引导记录来完成。可以方便的创建双启动的菜单。
- **bcdedit.exe** : 侧重于编辑 **BCD** 文件中的某一个条目;也用于 **bcdboot.exe** 无法使用的场景下。比如 **Windows 7** 和**Windows XP** 双启动的场景下XP系统没有 **BCD** 文件，也就无法使用 **bcdboot.exe** ，但是 **bcdedit.exe** 则是可以为XP添加一个启动项条目的。


# 2 bcdboot.exe {#2-bcdboot-exe}

位于 : `%systemroot%\system32\bcdboot.exe`。

**bcdboot.exe** 是**Vista**引入的一个用于管理 **BCD** 的命令行工具。它把小部分启动环境文件从已安装的Windows中复制到系统分区。常用于创建或修复 **BCD**。

## 2.1 bcdboot.exe 示例 {#2-1-bcdboot-exe-example}

```powershell
# 设置或修复启动菜单 : 添加c盘的win10系统到启动菜单，如果已存在则忽略，否则进行修复或新增。
bcdboot c:\windows

# 设置或修复双启动菜单 : 添加d盘的win7系统到启动菜单，和上例中的win10形成双启动菜单。
bcdboot d:\windows
```

# 3 bcdedit.exe  {#3-bcdedit-exe}

位于 : `%systemroot%\system32\bcdedit.exe`。

**bcdedit.exe** 是 **Vista** 引入的一个用于管理 **BCD** 的命令行工具。用来创建新存储、修改现有存储以及添加启动菜单选项等等。

## 3.1 bcdedit.exe 示例 {#3-1-bcdedit-exe-example}

```powershell
# 显示帮助信息。
bcdedit /? <command>

# 列出所有的启动项
bcdedit /emun /v

# 导出当前系统的启动配置数据到d盘。
bcdedit /export d:\bcd-backup

# 设置默认启动菜单的超时时间为5秒。
bcdedit /timeout 5
```

# 4 bootsect.exe  {#4-bootsect-exe}

位于 : `%systemroot%\system32\bootsect.exe`。


# 5 参考 {#5-reference}

https://zh.wikipedia.org/wiki/Windows_Vista

https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcdedit-command-line-options

https://msdn.microsoft.com/zh-cn/library/windows/hardware/mt450468(v=vs.85).aspx

https://superuser.com/questions/693715/what-is-the-equivalent-command-for-bcdboot-in-bcdedit

https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/bcdboot-command-line-options-techref-di

https://msdn.microsoft.com/zh-cn/library/windows/hardware/dn898490(v=vs.85).aspx

https://docs.microsoft.com/en-us/windows-hardware/manufacture/desktop/bootsect-command-line-options

https://msdn.microsoft.com/zh-cn/library/windows/hardware/dn898493(v=vs.85).aspx

[Vista]:https://zh.wikipedia.org/wiki/Windows_Vista


[bcdboot.exe]:#2-bcdboot-exe
[bcdedit.exe]:#3-bcdedit-exe