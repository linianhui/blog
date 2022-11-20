---
title: '[OIDC in Action] 02 基于OIDC的SSO - JS Client'
created_at: 2017-11-27 12:19:00
tag: ["OIDC", "OpenId Connect", "SSO", "oidc-client.js"]
toc: true
displayed_on_home: true
---

在上一篇[[OIDC in Action] 01 基于OIDC的SSO][01]的中涉及到了4个Web站点 : 

1. oidc-server.dev : 利用oidc实现的统一认证和授权中心，SSO站点。
2. oidc-client-hybrid.dev : oidc的一个客户端，采用hybrid模式。
3. oidc-client-implicit.dev : odic的另一个客户端，采用implicit模式。
4. oidc-client-js.dev : oidc的又一个客户端，采用implicit模式，纯静态网站，只有js和html，无服务端代码。

其中hybrid和implicit这两个站点都是具有在服务端执行代码的能力的(1，登录需要在服务端做跳转；2，登录状态写入cookie；3，通过服务端的接口接收被动的退出通知)。而js这个客户端则是一个纯粹的静态网站，那么它是如何处理登录和退出的呢？

oidc-client-js.dev这个web站点对应的代码位于web.oidc.client.js这个文件夹中(<https://github.com/linianhui/oidc.example/tree/master/1-src/web.oidc.client.js>) : 
![](0.png)

# 1 JS Client 登录 {#js-client-login}

我们知道在浏览器中的JS是可以直接进行页面跳转的，oidc的js客户端就是利用这个来直接构造认证请求的URL，然后进行登录跳转的(我们这里使用的是[oidc-client.js](https://github.com/IdentityModel/oidc-client-js)这个开源的js库来处理oidc规范相关的一下操作的)。下图是打开oidc-client-js.dev后的页面 : 
![](1.0.png)

## 1.1 JS Client 发起认证请求 {#js-client-send-authentication-request}

我们点击下Login。
![](1.1.0.png)

可以看到Client这边在对oidc-server.dev这个站点发起了2个请求之后就直接构造了一个认证请求的URL，并交给浏览器去发起了请求。

1. `/account/js` : 我自己扩展的，后面介绍其用途，目前暂时忽略它。
2. `/.well-known/openid-configuration` : 这个是之前介绍到的[OIDC提供的Discovery服务][authc-and-authz-oidc-discovery]，Client需要从这个服务返回的JSON中获取认证请求的接口地址以及其他的信息。

认证请求这里面包含的参数和上篇中的信息并没有什么差别，这里就不介绍了。

## 1.2 OIDC-Server 返回认证响应信息 {#oidc-server-authentication-reponse}

浏览器会重定向到登录页面，我们登录一下，登录成功后会跳转上面所填写的redriect_uri参数指定的URL，并使用URL的`#`部分携带认证后的信息 : 

> http://oidc-client-js.dev/oidc/login-callback.html<span style="color: #ff0000;">#</span><span style="color: #ff6600;">id_token</span>=eyJhbGciOiJSUzI1NiIsImtpZCI6ImI2MmE2YTVlZjNiNGJmOTlhNWU3M2FkZmI1OTQ3NjRjIiwidHlwIjoiSldUIn0.eyJuYmYiOjE1MTE3NTEyMjgsImV4cCI6MTUxMTc1MTUyOCwiaXNzIjoiaHR0cDovL29pZGMtc2VydmVyLmRldiIsImF1ZCI6ImpzLWNsaWVudCIsIm5vbmNlIjoiZGU5NGI1NGMzNDk1NGFjMjg0Y2I0NzlhY2M5ZGMxMjMiLCJpYXQiOjE1MTE3NTEyMjgsImF0X2hhc2giOiJ1QnJhckVLOHk4elhwR0pJOG1BaE1nIiwic2lkIjoiMWQ2ZWQwYWI0ZjdhNzI2MDUxMzBiYjBkYjNiOTdkY2MiLCJzdWIiOiIwMDAwMDEiLCJhdXRoX3RpbWUiOjE1MTE3NTEyMjgsImlkcCI6ImxvY2FsIiwiYW1yIjpbImV4dGVybmFsIl19.EUMT0R34OKDuE8AESEnRAASoRCP2NCAy7EEkMdM9vBwfz8BGnrCGXiDnKoUgbw3qK8ekoiwhSed6qE-Xh5QqnnwQTOc_D0nucbA3CVqKDhc9TFonEHoU60ETbX0i70bbOThZeoJdto9CkILbcewk2SLgfCQXZzsKERm6AS7m9LUN7cGjQJQm6Ht5DpIgjFu7s9V7qnUfu7hjvI51zPmYgJwLtvCXb9vAxXy17oBrVTmYunDLETRnfj9UXcsSROOW6Ac6sKSLOtFkY5ElZuIa5Za_1GJFDaoYyZwFT53WWBO9-LBdIHd8Cqx5fyw8tlpT3qmdwf0scSr256sVXykGQw&amp;<span style="color: #ff6600;">access_token</span>=eyJhbGciOiJSUzI1NiIsImtpZCI6ImI2MmE2YTVlZjNiNGJmOTlhNWU3M2FkZmI1OTQ3NjRjIiwidHlwIjoiSldUIn0.eyJuYmYiOjE1MTE3NTEyMjgsImV4cCI6MTUxMTc1NDgyOCwiaXNzIjoiaHR0cDovL29pZGMtc2VydmVyLmRldiIsImF1ZCI6WyJodHRwOi8vb2lkYy1zZXJ2ZXIuZGV2L3Jlc291cmNlcyIsIm15LWFwaSJdLCJjbGllbnRfaWQiOiJqcy1jbGllbnQiLCJzdWIiOiIwMDAwMDEiLCJhdXRoX3RpbWUiOjE1MTE3NTEyMjgsImlkcCI6ImxvY2FsIiwic2NvcGUiOlsib3BlbmlkIiwicHJvZmlsZSIsIm15LWFwaSJdLCJhbXIiOlsiZXh0ZXJuYWwiXX0.BU65olTuhLSlyFHyRzSHKUaFw5v5qMg7qmutl3LCel0gtjD9ky9cyD3rUNNAkalVcHXg7znN_F2JB71ape9mSD_L66H8pTTwaiMTxbPz9_HMEz9w6GgmOrjMGP8unIpCOKom1DV4EiSQoDe8P30oh2mwmA5SLvZixlAln3_ycArTd7440SCUrUvnEa1CJyl-K-kkLvLyl3TRo6bDE-H47-AzHq1NtA22cwleVXNxUtOsMHk1Nsa2tOFW6B4t3fAvo_MWx2BFkJMBToy4ArepLXSaN5CQQxH8na1Havll3Ly3c9GOslNsm1krMvx9GYdFR6DgjoDvNbaVDkLdmO2T_w&amp;<span style="color: #ff6600;">token_type</span>=Bearer&amp;<span style="color: #ff6600;">expires_in</span>=3600&amp;<span style="color: #ff6600;">scope</span>=openid%20profile%20my-api&amp;<span style="color: #ff6600;">state</span>=96af404863044d49b6e14a5827862538&amp;<span style="color: #ff6600;">session_state</span>=C33U-BpeYNeLhWhUuKLfup18cjKkKX54yCdL2fUOtV0.5ec877a6108fde6ad04e774a770d7ee1

这里相比上一篇中返回的信息多了一个access_token是因为我们的认证请求的response_type设置为了`id_token token`，故而oidc-server.dev把id_token和access_token一并给到了客户端。

## 1.3 JS Client 接收认证响应 {#js-client-handler-authentication-reponse}

解析#后面的数据也是通过[oidc-client.js](https://github.com/IdentityModel/oidc-client-js) 这个开源的库来实现的。解析后的数据呈现在页面上是如下这个样子。
![](1.3.0.png)

其中登录后用户的信息保存在浏览器的SessionStorage中 : 
![](1.3.1.png)

# 2 JS Client 主动登出 {#js-client-initiative-logout}

退出操作和其他类型的客户端一致，也是先清理自己保存的Session Storage，然后通知oidc-server.dev进行登出，这里就不详细解释了。

# 3 JS Client 被动登出 {#js-client-passive-logout}

我们知道在SSO中，除了自身主动退出登录之外，还有其他的Client退出的时候，这里的JS Client也要被动的登出。由于JS Client没有服务端在服务端执行代码的能力，其登录状态也是保存在客户端这边的，那么它就没办法接收像其他的客户端一样接收到登出的通知了。这个时候就需要客户端自己主动去oidc-server.dev检查登录状态了。这一部分在OIDC中也有标准规范，体现在[OIDC的Discovery服务][authc-and-authz-oidc-discovery]中的`check_session_iframe`字段中。
![](3.0.png)

这个地址checksession的地址是oidc-server.dev的地址，那么这个地址返回的html页面中，就可以通过js来检查去存储在cookie中的session信息的是否发生变化。然后通过H5中新增的postMessage来把这种变化传递给js client这边。js client再去检查一下是否已经登出了。如果已经登出，则会清理自身的登录状态来完成被动的登出操作。

比如下图。我再oidc-client-implicit.dev点击登出的时候，会触发oidc-server.dev清理自己的cookie，然后js-client中使用check_session_iframe这个隐藏的iframe可以检测到这种变化，从而使得js-client可以得知用户已经再其他的client退出登录。
![](3.1.png)

# 4 自动登录 {#auto-login}

前面提到JS Client会加载一个`oidc-server.dev/account/js`的JS脚本文件，这个是我自己扩展出来的一个脚本。它会在这个纯静态的网站在一开使打开的时候告诉客户端oidc-server.dev是否已经登录了。
![](4.0.png)

然后静态的网站就可以利用account这个变量来决定是否再打开网站的时候就自动去登录(由于其他站点已经登陆过了，那么oidc-server.dev站点会自动携带登录后的信息的再次跳转回来)。
![](4.1.png)

读者可以打开浏览器，先打开oidc-client-implicit.dev这个站点并且登录，然后再打开oidc-client-js.dev这个站点的时候，就会发现它会自动的登录成功了。

# 5 总结 {#summary}

&nbsp;本篇介绍了再浏览器中运行的纯静态的HTML网站使如何使用OIDC服务进行单点登录，统一登出，登录状态监控，以及附加的如何让JS Client自动登录的原理。这里所使用的例子使传统的HTML+JS的结构。如果你使采用的Vue，Angular或者React的这类前端框架的话，那么其本质上的原理也是完全一样的，因为不管使采用的什么框架，最终输出给浏览器的还是HTML+JS而已。

# 6 参考资料 {#reference}

本文源代码 : https://github.com/linianhui/oidc.example

oidc-client.js : https://github.com/IdentityModel/oidc-client-js


[01]:../01-oidc-sso/

[authc-and-authz-oidc-discovery]:/authentication-and-authorization/05-openid-connect-extension/#oidc-discovery
