---
title: '[Linux] 01 Basic'
created_at: 2017-01-06 16:34:01
tag: ["Linux", "bash"]
toc: true
---


# 1 Commands, Parameters/Arguments, Options {#commands-parameters-arguments-options}

```sh
# show the current shell.
echo $SHELL

# displays all installed shell.
cat -n /etc/shells
```

1. command : `cat`
2. option : `-n`
3. parameters/arguments : `/etc/shells`

# 2 Special Characters {#special-characters}

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
| `‘`            | Strong quote                   |
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
