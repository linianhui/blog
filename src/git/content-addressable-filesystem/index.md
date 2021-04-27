---
title: '[Git] 内容寻址文件系统'
created_at: 2020-04-27 00:55:01
tag: ["Git","filesystem","content-addressable"]
toc: true
draft: true
---

不要感觉奇怪，为什么介绍Git的文章里面怎么会出现一个**文件系统**，还**内容寻址**，这都是什么意思啊？其实`内容寻址文件系统(content-addressable filesystem)`才是git的底层核心，而我们平时使用的`commit`，`branch`和`checkout`等等命令仅仅只是在上层包装成了VCS(version control system)的样子。

**文件系统**是用来在物理存储设备上为上层应用提供抽象的文件管理功能的。比如常见的fat、fat32、ntfs、ext4等等。

**内容寻址**指的是基于文件的内容来定位文件，git使用`SHA1`[^sha1]信息摘要算法来唯一标识文件的。而非文件系统中常用的基于文件的位置(location)，比如`/bin/sh`这样的路径位置。

Git的所有秘密都藏在`.git`文件夹下，我们这就来一探究竟。

# 1 .git directory {#git-directory}

初始化一个新的仓库`git init temp`，然后查看一下默认的目录结构`tree .git`。

```sh
├── HEAD
├── config
├── description
├── hooks
│   ├── applypatch-msg.sample
│   ├── commit-msg.sample
│   ├── fsmonitor-watchman.sample
│   ├── post-update.sample
│   ├── pre-applypatch.sample
│   ├── pre-commit.sample
│   ├── pre-merge-commit.sample
│   ├── pre-push.sample
│   ├── pre-rebase.sample
│   ├── pre-receive.sample
│   ├── prepare-commit-msg.sample
│   ├── push-to-checkout.sample
│   └── update.sample
├── info
│   └── exclude
├── objects
│   ├── info
│   └── pack
└── refs
    ├── heads
    └── tags
```

# 2 object {#git-object}

## 2.1 blob object {#git-blob-object}
## 2.2 tree object {#git-tree-object}
## 2.3 commit object {#git-commit-object}

# 3 ref {#git-ref}

## 3.1 HEAD ref {#git-head-ref}
## 3.2 tag ref {#git-tag-ref}
## 3.3 remote ref {#git-remote-ref}

# 4 packfile {#git-packfile}

# 5 reference {#reference}

[^git-internal]:《Pro Git 2nd Edition (2014)》- Git 内部原理 <https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain>
[^sha1]: 密码散列函数-SHA1 <https://linianhui.github.io/information-security/01-cryptography-toolbox-1/#sha>