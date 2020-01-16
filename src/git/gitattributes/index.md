---
title: '[Git] .gitattributes'
created_at: 2020-01-16 20:52:01
tag: ["Git","gitattributes"]
toc: true
---

# 1 `.gitattributes` 的作用 {#1-effects}

位于Git Repo根目录的`.gitattributes`文件，用来为Git管理的文件配置一些属性。这些属性控制着Git管理的如下三个区域的文件。

![Git 三个工作区域](git-areas.png) 

通常主要用来统一`EOL=end of line`（在Windows上默认是`crlf`, 在Linux和macOS上则是`lf`）。

## 1.1 语法 {#1-1-syntax}

`.gitattributes`是一个文本文件，每一行使用匹配一些文件，然后设置对应的属性:

```ini
pattern attr1 attr2 ...
```

每一个属性都遵循如下4种规则进行配置:
```ini
# 设置attr1，表示true
pattern attr1

# 未设置attr1，表示false
pattern -attr1

# 设置attr1的值为1
pattern attr1=1

# 未指定任何值
pattern 
```


## 1.2 `text` 属性 {#1-2-text-attribute}

`text`属性指示Git如何处理 **.git directory** 区域中的文本文件的EOL。比如:

```ini
# 使用lf存储*.sh文件。
*.sh text

# 不控制*.sh文件的EOL。
*.sh -text
```

## 1.3 eol 属性 {#1-3-eol-attribute}

`eol`属性指示Gir如何处理 **working directory** 区域中的文本文件的EOL。比如:

```ini
# 使用lf存储*.sh文件, 在working directory则继续使用lf。
*.sh  text eol=lf

# 使用lf存储*.cs文件, 在working directory则自动转换为crlf。
*.cs  text eol=crlf
```

# 2 MACRO 属性 {#2-macro-attribute}

内置的宏属性`binary`等价于`-diff -merge -text`


# 3 最佳实践 {#3-best-practice}

当前站点项目所使用的配置如下:

{{<highlight-file file="/.gitattributes" lang="ini">}}

这样以来存储到Git中的文本文件都统一采用`lf`，而针对个别文件在工作区中采用`crlf`(亦可灵活的调整工作区中的EOL,而无需改动存储区已经存在的文件)，需同时进行如下设置
```bash
# 阻止Git进行自动转换
git config --global core.autocrlf false

# 当提交的文件不符合.gitattributes的配置时，阻止git add命令
git config --global core.safecrlf true
```

`.gitattributes`文件加入git仓库中后，需要执行一下如下命令:
```bash
git add --renormalize .
```
上述命令会检查git仓库中不符合配置的一些文件，然后再把这些文件commit到仓库中即可。


# 4 参考 {#4-reference}

https://git-scm.com/docs/gitattributes

https://help.github.com/en/github/using-git/configuring-git-to-handle-line-endings
