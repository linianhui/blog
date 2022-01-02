---
title: "[计算机网络] DoH(DNS over HTTPS)"
created_at: 2022-01-01 13:55:00
tag: ["DNS","DoH","HTTP","HTTPS"]
toc: true
---

**RFC8484 DNS Queries over HTTPS (DoH)**[^rfc8484]

# MIME {#mime}

`application/dns-message`。

1. Type : `application`。
2. SubType : `dns-message`。
3. 编码格式 : 二进制格式，定义在RFC1035[^rfc1035]。

# Example {#example}

```http
:method = GET
:scheme = https
:authority = dnsserver.example.net
:path = /dns-query?dns=AAABAAABAAAAAAAAA3d3dwdleGFtcGxlA2NvbQAAAQAB
accept = application/dns-message
```

```http
:status = 200
content-type = application/dns-message
content-length = 61
cache-control = max-age=3709

00 00 81 80 00 01 00 01  00 00 00 00 03 77 77 77
07 65 78 61 6d 70 6c 65  03 63 6f 6d 00 00 1c 00
01 c0 0c 00 1c 00 01 00  00 0e 7d 00 10 20 01 0d
b8 ab cd 00 12 00 01 00  02 00 03 00 04
```

待补充...

# Reference {#reference}

[^rfc8484]:RFC8484 DNS over HTTPS (DoH) : <https://datatracker.ietf.org/doc/html/rfc8484>
[^rfc1035]:DOMAIN NAMES - IMPLEMENTATION AND SPECIFICATION : <https://datatracker.ietf.org/doc/html/rfc1035>
[^wiki-dns]:<https://en.wikipedia.org/wiki/Domain_Name_System>
