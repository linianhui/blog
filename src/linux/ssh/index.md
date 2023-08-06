---
title: '[Linux] SSH'
created_at: 2017-03-29 09:42:01
tag: ["Linux", "ssh"]
toc: true
---


# 1 ssh {#ssh}

```sh
ssh lnh@deb1 -p 22
```

# 2 ssh-keygen {#ssh-keygen}

```sh
# Create RSA private(`id_rsa`) and public(`id_rsa.pub`) key pair.
ssh-keygen -t rsa
```


# 3 scp {#scp}

```sh
# Copy file.
scp 1.txt lnh@deb1:/home/lnh/1.txt
```

# 4 ssh-copy-id {#ssh-copy-id}

```sh
# Copy `id_rsa.pub` to `~/.ssh/authorized_keys`.
ssh-copy-id -i id_rsa.pub lnh@deb1
```


# 5 sshd_config {#sshd-config}

` /etc/ssh/sshd_config`

```ini
RSAAuthentication     yes
PubkeyAuthentication  yes
AuthorizedKeysFile    .ssh/authorized_keys
```