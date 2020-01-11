---
title: '[Kindle] kindlegen'
created_at: 2020-01-11 10:37:01
tag: ["Kindle", "kindlegen"]
toc: true
---


# 1 Download {#1-download}

主页 : <https://www.amazon.com/gp/feature.html?docId=1000765211>。**美国IP打开才能看到下载地址。打开后的地址如下表格** : 

| os      | download url                                                             |
| :------ | :----------------------------------------------------------------------- |
| windows | <http://kindlegen.s3.amazonaws.com/kindlegen_win32_v2_9.zip>             |
| macos   | <http://kindlegen.s3.amazonaws.com/KindleGen_Mac_i386_v2_9.zip>          |
| linux   | <http://kindlegen.s3.amazonaws.com/kindlegen_linux_2.6_i386_v2_9.tar.gz> |


# 2 EPUB to MOBI {#2-epub-to-mobi}


```powershell
# 转换epub为mobi
kindlegen.exe xxx.epub
```

[epub-to-mobi.bat](epub-to-mobi.bat)

# 3 help {#3-help}

```powershell
kindlegen.exe

*************************************************************
 Amazon kindlegen(Windows) V2.9 build 1029-0897292
 命令行电子书制作软件
 Copyright Amazon.com and its Affiliates 2014
*************************************************************

使用规则 : kindlegen [文件名.opf/.htm/.html/.epub/.zip 或目录] [-c0 或 -c1 或 c2] [-verbose] [-western] [-o <文件名>]
注释：
   zip formats are supported for XMDF and FB2 sources
   directory formats are supported for XMDF sources
Options:
   -c0：不压缩
   -c1：标准 DOC 压缩
   -c2：Kindle huffdic 压缩
   -o <file name>：指定输出文件名。输出文件将被创建在与输入文件一样的目录中。<file name> 不应该包含目录路径。
   -verbose： 在电子书转换过程中提供更多信息
   -western：强制创建 Windows-1252 电子书
   -releasenotes：显示发行说明
   -gif：转换为 GIF 格式的图像（书中没有 JPEG）
   -locale <locale option> ： 以选定语言显示消息 ( To display messages in selected language )
      en: 英语
      de: 德语
      fr: 法语
      it: 意大利语
      es: 西班牙语人
      zh: 中文
      ja: 日本
      pt: 葡萄牙
      ru: Russian
      nl: Dutch
```
