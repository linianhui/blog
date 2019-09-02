---
title: '[认证&授权] 03 使用OAuth2进行用户认证(译)'
created_at: 2017-04-09 16:59:00
---

原作者 : [Justin Richer], 原文: [User Authentication with OAuth 2.0][OAuth2-Authentication]。

[OAuth2]规范定义了一个**授权(delegation)**协议，对于使用Web的应用程序和API在网络上传递**授权决策**非常有用。OAuth被用在各钟各样的应用程序中，包括提供用户认证的机制。这导致许多的开发者和API提供者得出一个OAuth本身是一个**认证**协议的</span>错误结论，并将其错误的使用于此。在此需要明确指出 :  

- **OAuth2不是认证协议**。
- **OAuth2不是认证协议**。 
- **OAuth2不是认证协议**。 

混乱的根源来自于在认证协议的**内部**实际上使用了OAuth，开发人员看到OAuth组件并与OAuth流程进行交互，并假设通过简单地使用OAuth，他们就可以完成用户认证。这不仅不是事情的真相，而且对服务提供商，开发人员以及最终用户而言都是危险的事情。

本文旨在帮助潜在的**身份提供者**如何基于OAuth2构建用户身份认证。实际上，如果你说**我有OAuth2，并且我需要身份认证**，那么请继续往下看。

# 什么是认证(Authentication)？ {#what-is-authentication}

在用户访问一个应用程序的上下文环境中**认证**会告诉应用程序**当前用户是谁**以及其是否存在。一个完整的认证协议可能还会告诉你一些关于此用户的相关属性，比如唯一标识符、电子邮件地址以及应用程序说`早安`时所需要的内容。认证是关于应用程序中存在的用户，而互联网规模的认证协议需要能够跨网络和安全边界来执行此操作。

然而，OAuth没有告诉应用程序上述任何信息。OAuth对用户没有任何说明，也没有说明如何证明他们的存在，即使他们就在那里。对于OAuth的Client而言，它请求一个token，得到一个token，并用这个token访问一些API。但它不知道是谁授权的应用程序，以及甚至还有一个用户在那里。实际上，OAuth的大部分问题在于Client和被访问的资源之间的连接上在**用户不存在**的情况下使用这种委托访问。这对于Client授权来说是好的，但是对于用户身份认证来说却非常糟糕，因为认证需要确定用户是否存在(以及他们是谁)。

另外一个的混淆的因素，一个OAuth的过程通常包含在一些认证的过程中 :  资源所有者在授权步骤中向授权服务器进行身份验证，客户端向令牌端点中的授权服务器进行身份验证，可能还有其他的。OAuth协议中的这些认证事件的存在不能够说明OAuth协议本身能够可靠地传送认证。(译注 :  我觉得可能作者想表达的是虽然OAuth是这些认证事件的消费者，但却不是生产者，所以不能因为使用了认证，就等同于OAuth可以直接提供认证。)

事实证明尽管如此，还有一些事情可以和OAuth一起使用，以便在授权和授权协议之上**创建**身份认证协议。几乎在所有的这些情况下，OAuth的核心功能都将保持不变，而发生的事件是用户将他们的身份委派给他们正在尝试登录的应用程序。然后，客户端应用程序成为身份API的消费者，从而找出先前授权给客户端的用户。以这种方式建立身份验证的一个主要好处是允许管理最终用户的同意，这在互联网规模的跨域身份联合中是非常重要的。另一个重要的好处是，用户可以同时将访问其他受保护的API委托给他们的身份，使应用程序开发人员和最终用户管理更简单。通过一个调用，应用程序可以找出用户是否登录，应该调用什么用户，下载照片进行打印，并将更新发布到其消息流。这种简单性是非常有吸引力的，但当这两件事情同时进行时，许多开发人员将这两个功能混为一谈。

# 认证(Authentication) VS 授权(Authorization) {#authentication-vs-authorization}

为了帮助弄清楚这件事情，可以通过一个比喻来思考这个问题 :  巧克力 VS 软糖。在一开始，这两件事情的本质是截然不同的 :  巧克力是一种原料，软糖就是糖果。巧克力可以用来做许多不同的事情，甚至可以自己使用。软糖可以由许多不同的东西制成，其中一种可能是巧克力，但是需要多种成分来制造软糖，甚至不会用到巧克力。因此，**巧克力**等于**软糖**是错误的，而**巧克力**等于**巧克力软糖**肯定是夸大其词的。

在这个比喻中，OAuth是巧克力。这是一个多功能的原料，对许多不同的东西是至关重要的，甚至可以自己使用。认证更像是软糖，至少有一些成分必须以正确的方式汇集在一起​​，使其成为可能，OAuth**也许**是这些成分之一(可能是主要原料)，但可能也根本不需要参与其中。你需要一个配方来说明说明如何组合它们。

事实上，有一些众所周知的配方可以与特定的供应商进行合作，比如Facebook Connect、使用Twitter登录以及OpenID Connect(为Google的登录系统提供了支持)。这些配方每个都添加了一些项目到OAuth中以创建身份认证协议，比如通用的profile API。可以在没有OAuth的情况下构建身份验证协议吗？当然可以，就像有很多种非巧克力软糖一样。但是我们今天在这里谈论的是专门针对基于OAuth2的身份认证，以及可能出现什么问题，以及如何确保安全和美味。

# 使用OAuth进行认证的常见误区 {#common-pitfalls-for-authentication-using-oauth}

即使使用OAuth来构建身份验证协议是非常有可能的，但是在身份提供者或者身份消费者方面，有许多事情可能会让这些人脱节。本文中描述的做法旨在通知身份提供商的潜在的常见风险，并向消费者通报在使用基于OAuth的身份认证系统时可避免的常见错误。

## Access Token作为身份认证的证明 {#access-tokens-as-proof-of-authentication}

由于身份认证通常发生在颁发access_token的之前, 因此使用access_token作为身份认证的证明是非常诱人的。然而, 仅仅拥有一个access_token并没有告诉Client任何东西。在OAuth 中, token被设计为对Client不透明(译注 : 上一篇[[认证&授权] 02 OAuth2授权(续) & JWT(JSON Web Token)][02]中有介绍), 但在用户身份认证的上下文环境中, Client需要能够从token中派生一些信息。

此问题的根源在于Client不是OAuth access_token的预期**受众**。相反, 它是该token的**授权提出者**, 而**受众**实际上是受保护的资源。受保护的资源通常不能够仅通过token的单独存在来判断用户是否存在, 因为 oauth 协议的性质和设计, 在客户端和受保护资源之间的连接上用户是不可用的。为了应对这一点, 需要有一个针对客户本身的假象，这可以通过定义一个双重目的(dual-purposing)的Client可以解析和理解的access_token来完成。但是由于一般的OAuth没有为access_token本身定义特定的格式货结构，因此诸如OpenId Connect的ID Token和Facebook Connect的Signed在响应中提供一个次要的标记，它将和access_token一起发送给Client中。这可以使得Client对主要的access_token保持不透明，就像常规的OAuth中的那样。

## 访问受保护的API作为身份认证的证明 {#access-of-a-protected-api-as-proof-of-authentication}

由于access_token可以用于获取一组用户属性，因此拥有一个有效的access_token作为身份认证的证明也是很诱人的。在一些情况下，这种假设是成立的，因为在授权服务器商经过身份认证的用户上下文中，token是刚刚被创建的。但是在OAuth中，这并不是获取access_token的唯一方法，Refresh Token和assertions([Assertion Framework for OAuth 2.0 Client Authentication and Authorization Grants : https://tools.ietf.org/html/rfc7521](https://tools.ietf.org/html/rfc7521))可以在用户不存在的情况下获取access_token。而在某些情况下，用户无需身份验证即可获得access_token(译注 :  比如[[认证&授权] 01 OAuth2授权 - 5.4 Client Credentials Grant][01-5.4])。

此外，在用户不存在后，access_token通常还会存在很长时间。记住，OAuth是一个授权协议(`delegation protocol`)，这对它的设计至关重要。这意味着，如果一个Client想要确保身份认证是有效的，那么简单的使用token获取用户属性是不够的，因为OAuth保护的是资源，获取用户属性的API(identity API)通常没有办法告诉你用户是否存在。

## 注入Access Token {#injection-of-access-tokens}

另外一个额外的威胁(非常危险)是当Client接受来自token endpoint的token时。这可能会发生在使用implicit流程(这个流程中直接把access_token作为url的hash参数(译注 :  [[认证&授权] 01 OAuth2授权 - 5.2.2 Access Token Response][01-5.2.2])中，并且Client不正确的使用state参数的时候。如果应用程序在不同的组件中传递 access_token以**共享**访问权限的时候，也会发生此问题。这里的问题在于它开辟了一个注入access_token到应用程序外部(并可能在应用程序外部泄露)的地方。如果Client不通过某种机制验证access_token，则它无法区分access_token是有效的令牌还是攻击的令牌。

可以通过使用Authorization code来缓解这一点，并且只能通过授权服务器的token API(token endpoint)并使用一个state的值来避免被攻击者猜中。

## 缺乏受众限制 {#lack-of-audience-restriction}

另外一个问题是，通过access_token获取一组用户属性的OAuth API通常没有为返回的信息的受众做任何限制。换句话话说，很可能有一个幼稚的(naive)Client，从其他的Client拿到一个有效的token来作为自己的登录事件。毕竟令牌是有效的，对API的访问也会返回有效的用户信息。问题在于没有用户做任何事情来证明用户存在，在这种情况下，用户甚至都没有授权给幼稚的(naive)Client。

通过将Client的认证信息与Client可以识别和验证的标识符一起传递给Client，可以缓解此问题，从而允许客户端区分自身的身份认证与另一应用程序的身份认证。通过在OAuth的过程中直接向Client传递一组身份认证信息，而不是通过受OAuth保护的API这样的辅助机制来缓解它，从而防止Client在稍后的过程中注入未知来源的不可信的信息。

## 注入无效的用户信息 {#injection-of-invalid-user-information}

如果攻击者能够拦截或者替换来自Client的一个调用，它可能会改变返回的用户信息，而客户端却无法感知这一情况。这将允许攻击者通过简单地在正确的调用序列中交换用户标识符来模拟一个幼稚的(naive)Client上的用户。通过在身份认证协议过程中(比如跟随OAuth的Token的颁发过程)直接从身份提供程序中获取身份认证信息，并通过可校验的签名保护身份认证信息，可以缓解这一点问题。

## 每个潜在的身份提供商的不同协议 {#different-protocols-for-every-potential-identity-provider}

基于OAuth 身份(identity)API的最大问题在于，即使使用完全符合OAuth的机制，不同的提供程序不可避免的会使用不同的方式实现身份(identity)API。比如，在一个提供程序中，用户标识符可能是用user_id字段来表示的，但在另外的提供程序中则是用subject字段来表示的。即使这些语义是等效的，也需要两份代码来处理。换句话说，虽然发生在每个提供程序中的授权是相同的，但是身份认证信息的传输可能是不同的。此问题可以在OAuth之上构建标准的身份认证协议来缓解，这样无论身份认证信息来自何处，都可以用通用的方式传输。

这个问题之所以出现，是因为此处讨论的身份认证的机制被明确的排除在OAuth的范围之内。OAuth定义了一个[没有特定格式的token(no specific token format)](https://tools.ietf.org/html/rfc6749#section-1.4)，定义了一个[没有通用的范围(no common set of scopes)](https://tools.ietf.org/html/rfc6749#section-3.3)的access_token，并且没有解决[受保护资源如何验证access_token](https://tools.ietf.org/html/rfc6749#section-7)。

# 基于OAuth的用户认证的标准 : OpenId Connect {#a-standard-for-user-authentication-using-oauth-openid-connect}

OpenID Connect是2014年初发布的开放标准，定义了一种基于OAuth2的可互操作的方式来来提供用户身份认证。实际上，它是众所周知的巧克力软糖的配方，已经被多数的专家们尝试和测试了。应用程序不必为每个潜在的身份提供程序构建不同的协议，而是可以将一个协议提供给多个提供程序。由于OpenId Connect是一个开放标准，所以可以自由的没有任何限制的和知识产权问题的来实现。

OpenId Connect是直接建立在OAuth2之上的，在大多数情况下，部署在一个基于OAuth的基础设施之上。它还使用JOSN签名和加密规范，用来在传递携带签名和加密的信息。OpenId Connect避免了上面讨论的很多误区。

## ID Tokens {#id-tokens}

OpenID Connect Id Token是一个签名的JSON Web Token(JWT :  RFC7519)，它和OAuth access_token一起提供给Client应用程序。Id Token包含一组关于身份认证会话的声明(claim)，包括用户的标识(sub)、颁发令牌的提供程序的标识符(iss)、以及创建此标识的Client的标识符(aud)。此外，Id Token还包含token的有效生存期(通常非常短)以及其他相关的上下文信息。由于Client知道Id Token的格式，因此它能直接分析出token的内容而无需依赖外部服务。此外，OpenId Connect还颁发access_token给Client，允许Client保持对token的不透明，因为这是属于OAuth规范的一部分。最后，token本身是由提供程序的私钥进行签名的，除了在获取token中受TLS的保护之外，还添加了一个额外的保护层，以防止类似的模拟攻击。通过对此token的一些校验检查，Client可以保护自己免受大量常见的攻击。

由于Id token是授权服务器签名的，它还提供了在authorization code(c_hash)和access_token(at_hash)上添加分离签名的位置，这些hash可以由Client来验证，同时仍保留authorization code和access_token对Client不透明的语义，从而防止这一类的注入攻击。

应该指出的是，Client不再需要使用access_token，因为Id token已经包含了处理身份认证所需的所有信息。然而，为了保持和OAuth的兼容性，OpenId Connect会同时提供Id token和acces token。

## UserInfo Endpoint {#userinfo-endpoint}

除了Id token包含的信息之外，还定义了一个包含当前用户信息的标准的受保护的资源。如上所述，这些信息不是身份认证的一部分，而是提供附加的标识信息。比如说应用程序提示说**早上好 :  Jane Doe**，总比说**早上好 :  9XE3-JI34-00132A**要友好的多。它提供了一组标准化的属性 :  比如profile、email、phone和address。OpenId Connect定义了一个特殊的openid scope，可以通过access_token来开启Id token的颁发以及对UserInfo Endpoint的访问。它可以和其他scope一起使用而不发生冲突。这允许OpenId Connect和OAuth平滑的共存。

## 动态服务发现以及客户端注册 {#dynamic-server-discovery-and-client-registration}

OAuth2为了允许各种不同的部署而编写，但是这样的设计并没有指定这些部署如何设置以及组件之间如何互相了解，在OAuth自己的世界中这是没问题的。在使用OpenId Connect时，一个通用的受保护的API部署在各种各样的Client和提供者中，所有这些都需要彼此互相了解才能运行。对于每个Client来说，不可能事先了解有关每个提供程序，并且要求每个提供者了解每个潜在的Client，这将大大削弱扩展性。

为了抵消这种情况，OpenId Connect定义了一个发现协议，它允许Client轻松的获取有关如何和特定的身份认证提供者进行交互的信息。在另一方面，还定义了一个Client注册协议，允许Client引入新的身份提供程序(identity providers)。通过这两种机制和一个通用的身份API，OpenId Connect可以运行在互联网规模上运行良好，在那里没有任何一方事先知道对方的存在。

## 兼容OAuth2 {#compatibility-with-oauth2}

即使拥有这些强大的身份认证功能，OpenId Connect(通过设计)仍然与纯粹的OAuth2兼容，使其可以在开发人员花费最小代价的情况下部署在在OAuth系统之上。实际上，如果服务已经使用了OAuth和[JOSE](https://datatracker.ietf.org/wg/jose/charter/)规范(以及JWT)，该服务以及可以很好的支持OpenId Connect了。

# 译注 {#as}

本人翻译水平一般，如有错误之处，欢迎指正！

[Justin Richer]://https://twitter.com/justin__richer
[OAuth2]:http://tools.ietf.org/html/rfc6749
[OAuth2-Authentication]:https://oauth.net/articles/authentication
[02]:../02-oauth2-extensions-protocol-and-json-web-token/
[01-5.4]:../01-oauth2-authorization/#5.4.client-credentials-grant
[01-5.2.2]:../01-oauth2-authorization/#5.2.2.access-token-response