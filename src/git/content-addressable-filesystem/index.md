---
title: '[Git] 内容寻址文件系统'
created_at: 2020-04-27 00:55:01
tag: ["Git","filesystem","content-addressable"]
toc: true
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

# -p 打印blob的内容
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

有了blob存储的文件内容，那么文件和路径信息怎么存储呢？这里我们使用`git update-index`[^git-update-index]和`git write-tree`[^git-write-tree]来手工创建一个tree对象。

```sh
# 指定文件属性100644、blob的hash和文件的路径
git update-index --add --cacheinfo 100644 068b6574adc8d309c1ff2438ad82b63197144a63 test-dir/blob-file.txt

# 生成一个tree对象，返回树对象的hash
git write-tree
73e9fd0cc8f2199bc05ce95cbc0bef2b38e56345

# 查看一下这个tree对象（它代表的是test-dir这个文件夹），它包含另外一个tree对象
git cat-file -p 73e9fd0cc8f2199bc05ce95cbc0bef2b38e56345
040000 tree 9ec1a2094d5084786ba165358deaa8e68cba8314    test-dir

# 查看另一个tree对象，这次它指向的就是那个blob文件内容来，并且带上来文件名。
git cat-file -p 9ec1a2094d5084786ba165358deaa8e68cba8314
100644 blob 068b6574adc8d309c1ff2438ad82b63197144a63    blob-file.txt

# 再来看一下目前所有的对象
tree .git/objects
.git/objects
├── 06
│   └── 8b6574adc8d309c1ff2438ad82b63197144a63
├── 73
│   └── e9fd0cc8f2199bc05ce95cbc0bef2b38e56345
├── 9e
│   └── c1a2094d5084786ba165358deaa8e68cba8314
├── info
└── pack
```
## 2.3 commit object {#git-commit-object}

至此有了代表文件内容的blob和代表文件信息和路径信息的tree，那么是时候创建一个commit了。这里我们使用`git commit-tree`[^git-commit-tree]命令。

```sh
# 指定一个commit消息和tree对象，返回了commit对象hash
echo 'first commit form manual blob tree and commit' | git commit-tree 73e9fd0cc8f2199bc05ce95cbc0bef2b38e56345
bf84aa3517c5a51b50289f9ce17d7757b96a39dc

# 查看一下这个commit对象的信息
git cat-file -p bf84aa3517c5a51b50289f9ce17d7757b96a39dc
tree 73e9fd0cc8f2199bc05ce95cbc0bef2b38e56345
author lnh <lnhdyx@outlook.com> 1619526360 +0800
committer lnh <lnhdyx@outlook.com> 1619526360 +0800

first commit form manual blob tree and commit
```
# 3 ref {#git-ref}

## 3.1 HEAD ref {#git-head-ref}

这里我们使用`git update-ref`[^git-update-ref]命令来让main分支指向上面的commit；使用`git symbolic-ref`[^git-symbolic-ref]命令来让HEAD指向main分支。

```sh
# 让main分支指向上面创建的commit
git update-ref refs/heads/main bf84aa3517c5a51b50289f9ce17d7757b96a39dc

# 查看一下存储的文件
cat .git/refs/heads/main
bf84aa3517c5a51b50289f9ce17d7757b96a39dc


# 更新一下HEAD文件
git symbolic-ref HEAD refs/heads/main
# 查看HEAD文件，至此，一个commit算是完整的提交到分支上去了。
cat .git/HEAD
ref: refs/heads/main

# 那么我们看一下当前状态。咦，怎么提示我删除了一个文件呢？
# 这是因为我们上面的commit没有经过当前的工作区和暂存区，而是直接存储到了本地的repo中。
$ git status
On branch main
Changes not staged for commit:
  (use "git add/rm <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        deleted:    test-dir/blob-file.txt

no changes added to commit (use "git add" and/or "git commit -a")

# 我们清空一下暂存区即可。
git checkout .

# 然后你就看到我们刚刚手工commit的文件内容已经出现了。
tree
.
└── test-dir
    └── blob-file.txt
# 查看一下文件内容
cat test-dir/blob-file.txt
this is file content 1
```

## 3.2 tag ref {#git-tag-ref}
## 3.3 remote ref {#git-remote-ref}

# 4 packfile {#git-packfile}

# 5 reference {#reference}

[^git-internal]:《Pro Git 2nd Edition (2014)》- Git 内部原理 <https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain>
[^sha1]: 密码散列函数-SHA1 <https://linianhui.github.io/information-security/01-cryptography-toolbox-1/#sha>
[^git-hash-object]:`git hash-object` : <https://git-scm.com/docs/git-hash-object>
[^git-cat-file]:`git cat-file` : <https://git-scm.com/docs/git-cat-file>
[^git-write-tree]:`git write-tree` : <https://git-scm.com/docs/git-write-tree>
[^git-update-index]:`git update-index` : <https://git-scm.com/docs/git-update-index>
[^git-commit-tree]:`git commit-tree` : <https://git-scm.com/docs/git-commit-tree>
[^git-update-ref]:`git update-ref` : <https://git-scm.com/docs/git-update-ref>
[^git-symbolic-ref]:`git symbolic-ref` : <https://git-scm.com/docs/git-symbolic-ref>
[^stdin]:`man stdin` : <https://man7.org/linux/man-pages/man3/stdin.3.html>