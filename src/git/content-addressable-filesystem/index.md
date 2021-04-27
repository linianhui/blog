---
title: '[Git] 内容寻址文件系统'
created_at: 2020-04-27 00:55:01
tag: ["Git","filesystem","content-addressable"]
toc: true
#draft: true
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

Git有三个核心对象：blob、tree和commit。分别用来存储文件内容、文件信息和提交信息。

## 2.1 blob object {#git-blob-object}

使用`git hash-object`[^git-hash-object]手动生成一个blob对象，并且返回其SHA1。
1. `-w`：指示git把生成的blob对象持久化到objects文件夹下，路径是SHA1的前2个字符作为文件夹名，后38个字符作为文件名。
2. `-t blob`：指定类型为blob。
3. `--stdin`：指示git把从`stdin`[^stdin]中读取的内容作为文件内容。

```sh
# 生成一个blob对象
echo 'this is file content 1' | git hash-object -w -t blob --stdin
068b6574adc8d309c1ff2438ad82b63197144a63

# 查看objects
tree -f .git/objects
.git/objects
├── .git/objects/06
│   └── .git/objects/06/8b6574adc8d309c1ff2438ad82b63197144a63
├── .git/objects/info
└── .git/objects/pack
```

需要注意的是`git hash-object`并不是直接对内容计算SHA1，而是会添加一个`blob 23\0`的字符串，其中`23`是文件内容的byte长度。如下：
```sh
echo 'blob 23\0this is file content 1' | shasum -a 1
068b6574adc8d309c1ff2438ad82b63197144a63  -
```

所以如果文件内容保持不变，那么无论你执行多少次`git hash-object`，都只会有使用同一个blob对象。那么比如我们的git仓库中有两个文件的文件内容完全相同，但是文件名和所在目录不同，是不是只需要存储一份就可以了呢？感兴趣的可以自己试一试。
> 答案是只需存储一份blob对象即可。

当你用`cat`尝试去读取文件内容时，你会发现无法读取，这是因为它本身是一个二进制文件，而非文本文件。这时我们可以使用`git cat-file`[^git-cat-file]来读取。
```sh
cat .git/objects/4e/00bd9d3558b2129ca7b54c40f0847fab998f0f

# -p 打印内存
git cat-file -p 068b6574adc8d309c1ff2438ad82b63197144a63
this is file content 1

# -s 返回byte长度
git cat-file -s 068b6574adc8d309c1ff2438ad82b63197144a63
23

# -t 返回object的类型
git cat-file -t 068b6574adc8d309c1ff2438ad82b63197144a63
blob
```

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
[^git-hash-object]:`git hash-object` : <https://git-scm.com/docs/git-hash-object>
[^git-cat-file]:`git cat-file` : <https://git-scm.com/docs/git-cat-file>
[^stdin]:`man stdin` : <https://man7.org/linux/man-pages/man3/stdin.3.html>