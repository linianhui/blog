---
title: '[Rust] Install'
created_at: 2020-01-05 15:35:01
tag: ["Rust", "Install"]
toc: true
---

# 1 rustup-init {#rustup-init}

| platform     | download url                                                                      |
| :----------- | :-------------------------------------------------------------------------------- |
| windows-gnu  | <https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-gnu/rustup-init.exe>  |
| windows-msvc | <https://static.rust-lang.org/rustup/dist/x86_64-pc-windows-msvc/rustup-init.exe> |
| apple-darwin | <https://static.rust-lang.org/rustup/dist/x86_64-apple-darwin/rustup-init>        |


```powershell
# windows only
Env-SetRustEnvironmentVariable

# install
rustup-init.exe -y --verbose --default-toolchain stable --profile complete --no-modify-path
```

# 2 Reference {#reference}

<https://www.rust-lang.org/tools/install>

<https://forge.rust-lang.org/infra/other-installation-methods.html>
