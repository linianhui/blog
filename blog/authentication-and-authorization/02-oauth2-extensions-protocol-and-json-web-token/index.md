---
title: '[认证&授权] 02 OAuth2授权(续) & JWT(JSON Web Token)'
created_at: 2017-04-03 03:56:00
tag: ["OAuth2", "JWT"]
---

# 1 RFC6749还有哪些可以完善的？ {#1.rfc6749-defects}

## 1.1 撤销Token {#1.1.token-revocation}

在上篇[[认证&授权] 01 OAuth2授权][OAuth2授权]中介绍到了OAuth2可以帮我们解决第三方Client访问受保护资源的问题，但是只提供了如何获得access_token，并未说明怎么来撤销一个access_token。关于这部分OAuth2单独定义了一个[RFC7009 - OAuth 2.0 Token Revocation][RFC7009]来解决撤销Token问题。

## 1.2 Token对Client的不透明问题 {#1.2.token-opaque}

OAuth2提供的`access_token`是一个对Client不透明的字符串，尽管有`scope`，`expires_in`和`refresh_token`来辅助，但也是不完善的且分散的信息。还拿上一篇的小明来举例 : **小明**授权**在线打印并且包邮的网站**访问**自己的QQ空间**的**相册**。这句话其中有4个重要的概念 : 

1.  授权者**小明** : 表示是小明授权，而不是隔壁老王。
2.  被授权者**在线打印并且包邮的网站** : 表示授权给指定的网站，而不是其他的比如1024.com之类的网站(你懂的。。。)。
3.  小明**自己的QQ空间**表示让被授权者访问自己的信息，而不是隔壁老王的信息，小明也没这权限来着，不然隔壁王婶夜不答应吧。。。
4.  **相册** : 表示你可以访问我的相册，而不是我的日志，我的其他信息。

那么如何得到获得上面提到的这些附加的信息呢？OAuth2又单独提供了一个[RFC7662 - OAuth 2.0 Token Introspection][RFC7662]来解决Token的描述信息不完整的问题。

> 这些信息不但对Client不透明，对于资源服务器来说也是不透明的，比如授权服务器和资源服务器是独立部署的，而OAuth2又要求资源服务器要对access token做校验，没有这些信息如何校验呢？除非在access token的db存储层面做共享，但是作为一个运行在互联网规模上的网络环境下的协议，这种假设是无法支撑互联网规模的环境的。

# 2 RFC7009 OAuth2 Token Revocation {#2.rfc7009-oauth2-token-revocation}

简单来说，这个协议[RFC7009 - OAuth 2.0 Token Revocation][RFC7009]规定了一个Authorization Server提供一个怎样的API来供Client销access_token或者refresh_token。

比如Client发起一个如下的请求 : 

```http
POST /revoke HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

token=45ghiukldjahdnhzdauz&amp;token_type_hint=refresh_token
```

其中各项含义如下 : 

1. `/revoke` : 是Authorization Server需要提供的API地址，Client使用Post方式请求这个地址。
2. Content-Type: application/x-www-form-urlencoded : 固定此格式。
3. Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW : 访问受保护资源的授权凭证。
4. token : 必选，可以是`access_token`或者`refresh_token`的内容。
5. token_type_hint : 可选，表示token的类型，值为`access_token`或者`refresh_token`。

如果撤销成功，则返回一个HTTP status code为200的响应就可以了。

# 3 RFC7662 OAuth2 Token Introspection {#3.rfc7662-oauth2-token-introspection}

简单的总结来说，这个[RFC7662 - OAuth 2.0 Token Introspection][RFC7662]协议是为OAuth2扩展了一个API接口`Introspection Endpoint`，让第三方Client可以查询上面提到的那些信息(比如，access_token是否还有效，谁颁发的，颁发给谁的，scope又哪些等等的元数据信息)。

比如Client发起一个如下的请求 : 

```http
POST /introspect HTTP/1.1
Host: server.example.com
Accept: application/json
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer 23410913-abewfq.123483

token=2YotnFZFEjr1zCsicMWpAA&amp;token_type_hint=access_token
```

看起来和上面的撤销Token的请求差不多，其中各项含义如下 : 

1. `/introspect` : 是Authorization Server需要提供的API地址，Client使用Post方式请求这个地址。
2. Accept:application/json : 表示Authorization Server需要返回一个JSON格式的数据。
3. Content-Type: application/x-www-form-urlencoded : 固定此格式。
4. Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW : 访问受保护资源的授权凭证。
5. token : 必选，可以是`access_token`或者`refresh_token`的内容。
6. token_type_hint : 可选，表示token的类型，值为`access_token`或者`refresh_token`。

如果请求成功，则会返回如下的信息 : 

```json
{
  "active": true,
  "client_id": "l238j323ds-23ij4",
  "token_type":"access_token",
  "username": "jdoe",
  "scope": "read write dolphin",
  "sub": "Z5O3upPC88QrAjx00dis",
  "aud": "https://protected.example.net/resource",
  "iss": "https://server.example.com/",
  "exp": 1419356238,
  "iat": 1419350238,
  "nbf": 1419350238,
  "jti": "abcdefg",
  "extension_field": "twenty-seven"
}
```

JSON各项属性含义如下(其中有些信息是在JSON Web Token中定义的，参考链接有详细的介绍):

1. `active` : 必须的。表示token是否还是有效的。
2. `client_id` : 可选的。表示token所属的Client。比如上面的**在线打印并且包邮的网站**。
3. `token_type` : 可选的。表示token的类型。对应传递的token_type_hint。
4. `user_name` : 可选的。表示token的授权者的名字。比如上面的**小明**。
5. `scope` : 可选的。和上篇[5.1.1 Authorization Request][Authorization-Request]中的可选参数scope对应，表示授权给Client访问的范围，比如是相册，而不是小明的日志以及其他受保护资源。**注意这个scope是用户授权的真正的scope, 比如申请授予`read write dolphin`三个，但是用户可能批准了一个`read`**。 
6. `sub` : 可选的。token所属的资源拥有者的唯一标识，JWT定义的。也就是小明的唯一标识符。
7. `aud` : 可选的。token颁发给谁的，JWT定义的。
8. `iss` : 可选的。token的颁发者，JWT定义的。
9.  `exp` : 可选的。token的过期时间，JWT定义的。
10. `iat` : 可选的。iss颁发token的时间，JWT定义的。
11. `nbf` : 可选的。token不会在这个时间之前被使用，JWT定义的。
12. `jti` : 可选的。token的唯一标识，JWT定义的。
13. `extension_field` : 可以自己扩展相关其他属性。

其中大量的信息都是可选的信息，而且可以自己扩展需要的属性信息，从这些属性中就可以解决我们上面提到的access_token对于Client不透明的问题。

我们注意到其中有很多属于JWT定义的属性，那么这个JWT是什么东西？它解决了什么问题？

# 4 JSON Web Token (JWT) {#4.json-web-token}

简单总结来说，JWT是一个定义一种**紧凑的**，**自包含的**并且提供**防篡改机制**的传递数据的方式的标准协议。

我们先来看一个简单的示例 : 
<code>
<span style="color: #0000ff;">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.<span style="color: #008000;">eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imxpbmlhbmh1aSJ9</span>.<span style="color: #ff0000;">hnOfZb95jFwQsYj3qlgFbUu1rKpfTE6AzgXZidEGGTk</span>
</code>

就是这么一堆看起来像是乱码一样的字符串。JWT由3部分构成 : header.payload.signature，每个部分由`.`来分割开来。

## 4.1 Header {#4.1.json-web-token-header}

header是一个有效的JSON，其中通常包含了两部分 : token类型和签名算法。

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

对这个JSON采用base64编码后就是第1部分
<code>
<span style="color: #0000ff;">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>
</code>

## 4.2 Payload {#4.2.json-web-token-payload}

这一部分代表真正想要传递的数据，包含一组Claims，其中JWT预定义了一些Claim([RFC7662 OAuth2 Token Introspection](#3.rfc7662-oauth2-token-introspection))这一节就用到一些JWT预定义的一些Cliam)后面会介绍。关于什么是Claim，可以参考文章末尾给的参考链接。

```json
{
  "sub": "1234567890",
  "name": "linianhui"
}
```

对这个JSON采用base64编码后就是第2部分
<code>
<span style="color: #008000;">eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Imxpbmlhbmh1aSJ9</span>
</code>

## 4.3 Signature {#4.3.json-web-token-signature}

这一部分是可选的，由于前面Header和Payload部分是明文的信息，所以这一部分的意义在于保障信息不被篡改用的，生成这部分的方式如下 : 

```js
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

token生成方使用header中指定的签名算法对`header.payload`部分进行签名，得到的第3部分<code><span style="color: #ff0000;">hnOfZb95jFwQsYj3qlgFbUu1rKpfTE6AzgXZidEGGTk</span></code>,然后组合成一个完整的JWT字符串 . 而token消费方在拿到token后, 使用同样的签名算法来生成签名，用来判断`header`和`payload`部分有没有被篡改过，因为签名的密钥是只有通信双方知道的，所以可以保证这部分信息不被第三方所篡改。

## 4.4 JWT Claims {#4.4.json-web-token-signature}

JWT规范中预先定义了一些Cliam，但并不是必选的，常用的有 :

1. `iss` : Issuer 签发者。
2. `sub` : subject签发给的受众，在Issuer范围内是唯一的。
3. `aud` : Audience接收方。
4. `exp` : Expiration Time过期时间。
5. `iat` : Issued At签发时间 等等。

更完整的一些Claim列表参见 : <https://www.iana.org/assignments/jwt/jwt.xhtml>

如果上面这些仍无法满足自己的需要，则可以自定义一些来使用。

## 4.5 JWT 应用场景 {#4.5.json-web-token-application-scenarios}

由于其采用base64来进行编码，使得它可以安全的用在一些仅限_ASCII_的地方传递信息，比如URL的querystring中。

比如用户登陆后，可以把用户的一些属性信息(用户标识，是否是管理员，权限有哪些等等可以公开的信息)用JWT编码存储在cookie中，由于其自包含的性质，每次服务器读取到Cookie的时候就可以解析到当前用户对应的属性信息，而不必再次去查询数据库。如果Cookie中每次都发送浪费带宽，也可以用`Authorization: Bearer jwttoken` 的方式附加到Http Request上去。

# 5 OAuth2 & JWT  {#4.5.oauth2-and-json-web-token}

注意到我们在[RFC7662 OAuth2 Token Introspection](#3.rfc7662-oauth2-token-introspection)这一小节中，OAuth2返回Token的元数据的JSON，以及OAuth2中的access_token对Client是不透明的字符串这件事，我们可以把access_token的元数据信息用JWT来编码，作为access_token的字符串内容，这样是不是就可以使得它对Client是透明的了。

比如我之前遇到的问题，在我使用access_token的时候有没有过期我并不知道，其实需要借助辅助的`expires_in`来检查，还有其scope是哪些，也需要额外的去查询，再比如这个access_token管理的用户是谁，也需要额外的查询，有了JWT呢，可以把这些都打包进去，比如 : 

```json
{
  "sub":"linianhui",
  "scope":"1419356238",
  "exp":123456789,
}
```

然后生成一个这样的jwt字符串`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsaW5pYW5odWkiLCJzY29wZSI6IjE0MTkzNTYyMzgiLCJleHAiOjEyMzQ1Njc4OX0.ASu85ohHMSOhnxbJSJI4OKLsPlbjPs7th0Xw5-b4l1A`作为access_token，感觉一下子就方便了好多吧。

# 6 总结 {#6.summary}

OAuth2在RFC6749中并未完整的提供一些问题的解决方案，而是附加了一些相关的RFC来解决这些问题，其实除了本文中提到的2个问题点之外，还有一些其他可以优化的地方存在(比如服务发现 : <https://tools.ietf.org/html/draft-ietf-oauth-discovery-06>，From Post Response Mode :<http://openid.net/specs/oauth-v2-form-post-response-mode-1_0.html>)，这些点在后续的OIDC的文章中再做介绍吧，感兴趣的可以看一看<http://openid.net/connect/>中关于OAuth2的另外一些相关扩展标准草案，这些标准也是OIDC所需要的一些可选支持；以及OAuth相关扩展草案 : <https://datatracker.ietf.org/wg/oauth/charter/>。另外在一些场景下，使用JWT来使得OAuth2的提供自包含的Token还是一件很方便的事情的。

以上内容均是个人的一些理解，如果错误之处，欢迎指正！

# 7 参考资料 {#7.reference}

JSON协议 : [RFC7159 - The JavaScript Object Notation (JSON) Data Interchange Format](https://tools.ietf.org/html/rfc7159)

OAuth2 扩展协议 : 

[RFC7009 - OAuth 2.0 Token Revocation](https://tools.ietf.org/html/rfc7009)

[RFC7662 - OAuth 2.0 Token Introspection](https://tools.ietf.org/html/rfc7662)

OAuth相关扩展草案 : 

[https://datatracker.ietf.org/wg/oauth/charter/ ](https://datatracker.ietf.org/wg/oauth/charter/)

[https://tools.ietf.org/wg/oauth/](https://tools.ietf.org/wg/oauth/)

JWT相关协议族 : 

[RFC7515 - JSON Web Signature (JWS)](https://tools.ietf.org/html/rfc7515)

[RFC7516 - JSON Web Encryption (JWE)](https://tools.ietf.org/html/rfc7516)

[RFC7517 - JSON Web Key (JWK)](https://tools.ietf.org/html/rfc7517)

[RFC7518 - JSON Web Algorithms (JWA)](https://tools.ietf.org/html/rfc7518)

[RFC7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)

JWT官方站点 : [https://jwt.io](https://jwt.io/)

Claims : [https://en.wikipedia.org/wiki/Claims-based_identity](https://en.wikipedia.org/wiki/Claims-based_identity)

JWT注册的的一组Claims : [https://www.iana.org/assignments/jwt/jwt.xhtml](https://www.iana.org/assignments/jwt/jwt.xhtml)


[OAuth2授权]:../01-oauth2-authorization/
[Authorization-Request]:../01-oauth2-authorization/#5.1.1.authorization-request
[RFC7009]:https://tools.ietf.org/html/rfc7009
[RFC7662]:https://tools.ietf.org/html/rfc7662