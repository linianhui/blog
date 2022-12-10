---
title: '[Bash] Syntax'
created_at: 2017-01-06 16:34:01
tag: ["shell","command","option","parameter","syntax"]
toc: true
displayed_on_home: true
---

# 1 Command Option Parameter {#command-option-parameter}

```sh
# 查看版本
bash --version

# show the current shell.
echo $SHELL

# displays all installed shell.
cat -n /etc/shells
```

1. command : `cat`
2. option : `-n`
3. parameter : `/etc/shells`

## 1.1 Command {#command}

1. Pipeline
2. Looping
3. Conditional
4. Grouping

## 1.2 Parameter {#parameter}

| Character | Meaning                                                       |
| --------- | ------------------------------------------------------------- |
| `$0`      |                                                               |
| `$1`      |                                                               |
| `$@`      | subshell                                                      |
| `$#`      | subshell                                                      |
| `$?`      | exit status of the most recently executed foreground pipeline |
| `$-`      |                                                               |
| `$$`      |                                                               |
| `$!`      |                                                               |

# 2 Special Characters {#special-character}

| Character      | Meaning                        |
| -------------- | ------------------------------ |
| `#`            | Comment                        |
| <code>`</code> | Command substitution (archaic) |
| `$`            | Variable expression            |
| `(`            | Start subshell                 |
| `)`            | End subshell                   |
| `\`            | Quote next character           |
| `&`            | Background job                 |
| `{`            | Start command block            |
| `}`            | End command block              |
| `;`            | Shell command separator        |
| `'`            | Strong quote                   |
| `"`            | Weak quote                     |
| `!`            | Pipeline logical NOT           |


## 2.1 Wildcard Character {#wildcard-characters}

| Character | Meaning                      |
| --------- | ---------------------------- |
| `*`       | String wildcard              |
| `?`       | Single-character wildcard    |
| `[`       | Start character-set wildcard |
| `]`       | End character-set wildcard   |


## 2.2 Path Character {#path-characters}

| Character | Meaning                      |
| --------- | ---------------------------- |
| `/`       | Root directory               |
| `/`       | Pathname directory separator |
| `~`       | Home directory               |


## 2.3 I/O Character {#io-characters}

| Character | Meaning                          |
| --------- | -------------------------------- |
| `\|`      | Pipe                             |
| `<`       | Input redirect                   |
| `>`       | Output redirect                  |
| `>>`      | Append redirect (if file exists) |
| `2>`      | Error output redirect            |
| `2>&1`    | Send error to output redirect    |
