---
title: '[信息安全] 05 X.509 公钥证书的格式标准'
created_at: 2020-02-15 13:07:23
tag: ["X.509", "X.690", "ASN.1", "DER", "PEM", "CRL", "CA"]
toc: true
---

[X.509][X.509]是[# 公钥证书](#public-key-certificate)的格式标准, 广泛用于TLS/SSL安全通信或者其他需要认证的环境中。X.509证书可以由[# CA](#certificate-authority)颁发，也可以自签名生产。

# 1 Overview {#1-overview}

X.509证书中主要含有`公钥`、`身份信息`、`签名信息`和`有效性信息`等信息。这些信息用于构建一个验证公钥的体系，用来保证客户端得到的公钥正式它期望的公钥。

1. `公钥` : 非对称密码中的公钥。公钥证书的目的就是为了再互联网上分发公钥信息。
2. `身份信息` : 公钥持有者的信息，标识公钥的持有者以及用途。公钥对应的私钥持有者的信息，域名等等。
3. `签名信息` : 对公钥签名的信息，提供公钥的验证链。可以是CA的签名或者是自签名，不同之处在于CA证书的根证书大都内置于操作系统或者浏览器中，而自签名证书的公钥验证链则需要自己维护（手动导入到操作系统中或者再验证流程中单独提供自签名的根证书）。
4. `有效性信息`：证书的有效时间区间，以及[# CRL](#certificate-revocation-list)等相关信息。

X.509证书的标准规范[RFC5280][rfc5280]中详细描述了证书的[# 1.1 Encoding Format](#1-1-encoding-format)和[# 1.2 Structure](#1-2-structure)。


## 1.1 Encoding Format {#1-1-encoding-format}

X.509使用`二进制`的[# DER](#distinguished-encoding-rules)作为**`唯一`**的`Encoding Format`。我们常用的[# PEM](#privacy-enhanced-mail)则是把`二进制的DER编码的数据`的转换为[base64][base64]文本，以便于在仅支持`ASCII`的环境中传递或存储`二进制的DER编码的数据`。

## 1.2 Structure {#1-2-structure}

一个具体的X.509 v3数字证书结构大致如下 : 

```txt
Certificate
  Version Number
  Serial Number
  Signature Algorithm ID
  Issuer Name
  Validity period
  Not Before
  Not After
  Subject name
  Subject Public Key Info
  Public Key Algorithm
  Subject Public Key
  Issuer Unique Identifier (optional)
  Subject Unique Identifier (optional)
  Extensions (optional)
...
Certificate Signature Algorithm
Certificate Signature
```

# 2 File Extension {#2-file-extension}

`File Extension`和[# 1.1 Encoding Format](#1-1-encoding-format)是两个完全不同的概念。X.509有很多种常用的扩展名。不过这些扩展名有时候也是其他文件的扩展名，也就是说具有这个扩展名的文件并不一定是X.509证书。也可能只是保存了私钥的文件。

1. `.pem` : PEM格式。
2. `.cer`,`.crt`,`.der` : 通常是DER格式的公钥证书，也可能是PEM。

# 3 Reference {#reference}

## 3.1 公钥证书 {#public-key-certificate}

`Public Key Certificate`=`公钥证书`。

<https://en.wikipedia.org/wiki/Public_key_certificate>


## 3.2 CA {#certificate-authority}

`CA`=`Certificate Authority`=`证书颁发机构`。

<https://en.wikipedia.org/wiki/Certificate_authority>


## 3.3 DER {#distinguished-encoding-rules}

`DER`=`Distinguished Encoding Rules`是[# X.690](#x690)标准中的一种二进制编码格式。

下面的文件是<https://google.com>所使用的DER编码的二进制公钥证书文件。
{{<highlight-file file="google.com.der.cer" lang="txt">}}

参考资料 : <https://en.wikipedia.org/wiki/X.690#DER_encoding>。


## 3.4 PEM {#privacy-enhanced-mail}

`PEM`=`privacy-enhanced-mail`=`隐私增强邮件`。

PEM是一种事实上的标准文件格式，采用[base64][base64]来编码密钥或证书等其他二进制数据，以便于在仅支持`ASCII`文本的环境中传递或存储`二进制数据`。PEM在[RFC7468][rfc7468]中被正式标准化。具体格式如下:

```txt
-----BEGIN label 1-----
base64 string...
-----END label 1-----
-----BEGIN label 2-----
base64 string...
-----END label 2-----
```

其中`label 1`和`label 2`可以有`1~N`个。常用的`label`有(<https://tools.ietf.org/html/rfc7468#section-4>):

1. `CERTIFICATE` : 公钥证书文件 。
2. `CERTIFICATE REQUEST` : CSR请求证书文件。
3. `PRIVATE KEY` : 私钥文件。
4. `PUBLIC KEY` : 公钥文件。
5. `X509 CRL` : X509证书吊销列表文件。

下面的文件是上面的`google.com.der.cer`的PEM编码形式 :
{{<highlight-file file="google.com.pem.cer" lang="txt">}}

参考资料：<https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail>

## 3.5 CRL {#certificate-revocation-list}

`CRL`=`Certificate Revocation List`=`证书吊销列表`。

<https://en.wikipedia.org/wiki/Certificate_revocation_list>


## 3.6 X.690 {#x690}

[X.690][X.690]是一个ITU-T标准，规定了几种[ASN.1](#abstract-syntax-notation-1)编码格式:

`BER`=`Basic Encoding Rules` : <https://en.wikipedia.org/wiki/X.690#BER_encoding>
`CER`=`Canonical Encoding Rules` : <https://en.wikipedia.org/wiki/X.690#CER_encoding>
`DER`=`Distinguished Encoding Rules` : <https://en.wikipedia.org/wiki/X.690#DER_encoding>

## 3.7 ASN.1 {#abstract-syntax-notation-1}

`ASN.1`=`Abstract Syntax Notation 1`=`抽象标记语法1`。

<https://en.wikipedia.org/wiki/Abstract_Syntax_Notation_One>


[X.509]:<https://en.wikipedia.org/wiki/X.509>
[X.690]:<https://en.wikipedia.org/wiki/X.690>
[rfc5280]:<https://tools.ietf.org/html/rfc5280>
[rfc7468]:<https://tools.ietf.org/html/rfc7468>

[base64]:../01-cryptography-toolbox-1/#6-2-base64
