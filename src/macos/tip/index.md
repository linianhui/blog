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