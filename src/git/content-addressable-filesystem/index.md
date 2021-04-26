---
title: '[Git] 内容寻址文件系统'
created_at: 2020-04-27 00:55:01
tag: ["Git","filesystem","content-addressable"]
toc: true
draft: true
---

不要感觉奇怪，为什么介绍Git的文章里面怎么会出现一个**文件系统**，还**内容寻址**，这都是什么意思啊？

其实内容寻址文件系统（`content-addressable filesystem`）[^git-internal]才是git的底层核心，而我们平时使用的`commit`，`branch`和`checkout`等等命令仅仅只是在上层包装成了VCS(version control system)的样子。Git的所有秘密都藏在`.git`文件夹下，我们这就来一探究竟。

# 1 .git directory {#git-directory}

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