---
title: '[Linux] SSH'
created_at: 2017-03-29 09:42:01
tag: ["Linux", "ssh"]
toc: true
---


# 1 ssh {#1-ssh}

```sh
ssh lnh@ubts -p 22
```

# 2 ssh-keygen {#2-ssh-keygen}

```sh
# Create RSA private(`id_rsa`) and public(`id_rsa.pub`) key pair.
ssh-keygen -t rsa
```


# 3 scp {#3-scp}

```sh
# Copy file.
scp 1.txt lnh@ubts:/home/lnh/1.txt
```

# 4 ssh-copy-id {#4-ssh-copy-id}

```sh
# Copy `id_rsa.pub` to `~/.ssh/authorized_keys`.
ssh-copy-id -i id_rsa.pub lnh@ubts
```


# 5 sshd_config {#5-sshd-config}

` /etc/ssh/sshd_config`

```ini
RSAAuthentication     yes
PubkeyAuthentication  yes
AuthorizedKeysFile    .ssh/authorized_keys
```