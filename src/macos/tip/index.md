---
title: '[macOS] Tip'
created_at: 2021-03-10 09:44:23
tag: ["macOS"]
toc: true
---

# zsh {#zsh}

## .zshrc {#zshrc}

{{<highlight-file path="zshrc.sh" lang="sh">}}

# mount {#mount}

{{<highlight-file title="/etc/synthetic.conf" path="synthetic.conf" lang="ini">}}


# 禁用应用验证 {#disable-app-verify}

```bash
sudo spctl --master-disable
```

# 禁用SIP {#disable-sip}

```bash
# command+r
csrutil disable
```

# install

<https://support.apple.com/zh-cn/102655>
<https://support.apple.com/mac/startup>
<https://support.apple.com/zh-cn/102675>

在任何其他 Mac 上
1. 按下并松开电源按钮以将 Mac 开机。
2. 松开电源按钮后，立即按住下面的某一个组合键。如果这些组合键都不起作用，请查阅启动组合键的使用准则。
    1. Command-R：如果你在启动时按住这两个键，“恢复”会提供最近一次安装的 macOS 的最新版本。
    2. Option-Command-R：如果你在启动时按住这三个键，“恢复”可能会提供与 Mac 兼容的最新版 macOS。
    3. Shift-Option-Command-R：如果你在启动时按住这四个键，“恢复”可能会提供 Mac 随附的 macOS，或仍然可用的最接近版本。
3. 继续按住相应按键，直到看到 Apple 标志或旋转的地球。