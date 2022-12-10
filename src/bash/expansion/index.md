---
title: '[Bash] Expansion'
created_at: 2017-02-06 16:34:01
tag: ["shell", "expansion"]
toc: true
displayed_on_home: true
---

# Tilde Expansion `~` {#tilde-expansion}

`~` : `/home` or `/users` or `/Users`.
```sh
# user 'lnh'.
# /home/lnh/.bash_profile or /users/lnh/.bash_profile
echo ~lnh/.bash_profile

# current user home directory
echo ~
```

# Brace Expansion `{}` {#brace-expansion}

```sh
# a b c
echo {a..c}

# 01 02 03 04 05 06 07 08 09 10
echo {01..10}

# 1 3 5
echo {1..5..2}

# file1.txt file2.txt file3.txt file4.txt
echo file{1..4}.txt
```

# Shell Parameter Expansion `${}` {#shell-parameter-expansion}

## $\{var:-返回默认值不设置\} {#shell-parameter-expansion-default}

```bash
# 未初始化或者为null
var=
# 输出: 返回默认值不设置
echo ${var:-返回默认值不设置}
```

## $\{var:=返回默认值并设置\} {#shell-parameter-expansion-default-and-set}

```bash
# 未初始化或者为null
var=
# 输出: 返回默认值并设置
echo ${var:=返回默认值并设置}
```

## $\{var:?错误提示\} {#shell-parameter-expansion-error}

```bash
# 未初始化或者为null
var=
# 终止运行并推出
# 输出: -bash: var1: 错误提示
echo ${var:?错误提示} && echo 'ok'
```

## \${var:起始索引[:可选长度]} {#shell-parameter-expansion-sub}

支持负数索引，表示从后往前（但是注意索引前的空格不要少）。

```bash
# 字符串变量
str='01234567890abcdefgh'

# 输出: 7890abcdefgh
echo ${str:7}
# 输出: 7
echo ${str:7:1}
# 输出: 78
echo ${str:7:2}
# 输出: 7890abcdef
echo ${str:7:-2}
# 输出: bcdefgh
echo ${str: -7}
# 输出: bc
echo ${str: -7:2}
# 输出: bcdef
echo ${str: -7:-2}
```

当变量是数组时，长度不能为负数。
```bash
# 数组变量
arr=(0 1 2 3 4 5 6 7 8 9 0 a b c d e f g h)

# 输出: 7 8 9 0 a b c d e f g h
echo ${arr[@]:7}
# 输出: 7
echo ${arr[@]:7:1}
# 输出: 7 8
echo ${arr[@]:7:2}
# 输出: -bash: -2: substring expression < 0
echo ${arr[@]:7:-2}
# 输出: b c d e f g h
echo ${arr[@]: -7}
# 输出: b c
echo ${arr[@]: -7:2}
```

## \${#var} {#shell-parameter-expansion-var-lenght}

获取变量的长度
```bash
# 字符串变量
str='01234567890abcdefghk'
# 输出: 20
echo ${#str}

# 数组变量
arr=(0 1 2 3 4 5 6 7 8 9 0 a b c d e f g h)
# 输出: 19
echo ${#arr[@]}
```

## $\{var^^\} {#shell-parameter-expansion-uppercase}

转换为大写
```bash
# 字符串变量
str='01234567890abcdefghk'
# 输出: 01234567890ABCDEFGHK
echo ${str^^}
```

## $\{var,,\} {#shell-parameter-expansion-lowercase}

转换为小
```bash
# 字符串变量
str='01234567890ABCDEFGHK'
# 输出: 01234567890abcdefghk
echo ${str,,}
```