---
title: '[信息安全] 04 一次性密码 & 身份认证'
created_at: 2017-07-23 14:24:00
tag: ["OTP", "HOTP", "TOTP", "MFA", "2FA", "2SV"]
toc: true
---

在信息安全领域，一般把**Cryptography**称为**密码**，而把**Password**称为**口令**。日常用户的认知中，以及我们开发人员沟通过程中，绝大多数被称作密码的东西其实都是Password(口令)，而不是真正意义上的密码。本文保持这种语义，采用密码来代指Password，而当密码和口令同时出现时，用英文表示以示区分。

# 1 OTP 一次性密码 {#1-one-time-password}

OTP是One Time Password的简写，即一次性密码。在平时生活中，我们接触一次性密码的场景非常多，比如在登录账号、找回密码，更改密码和转账操作等等这些场景，其中一些常用到的方式有 :  

1. 手机短信+短信验证码；
2. 邮件+邮件验证码；
3. 认证器软件+验证码，比如Microsoft Authenticator App，Google Authenticator App等等；
4. 硬件+验证码 :  比如网银的电子密码器；

这些场景的流程一般都是在用户提供了账号+密码的基础上，让用户再提供一个一次性的验证码来提供一层额外的安全防护。通常情况下，这个验证码是一个6-8位的数字，只能使用一次或者仅在很短的时间内可用(比如5分钟以内)。

# 2. HOTP 基于消息认证码的一次性密码 {#2-hmac-based-one-time-password}

HOTP是HMAC-Based One Time Password的缩写，即是基于HMAC(基于Hash的[消息认证码])实现的一次性密码。算法细节定义在RFC4226(<https://tools.ietf.org/html/rfc4226>)，算法公式为 : `HOTP(Key,Counter)`，拆开是`Truncate(HMAC-SHA-1(Key,Counter))` 。

1. Key :  密钥；
2. Counter :  一个计数器；
3. HMAC-SHA-1 :  基于SHA1的HMAC算法的一个函数，返回MAC的值，MAC是一个20bytes(160bits)的字节数组；
4. Truncate :  一个截取数字的函数，以3中的MAC为参数，按照指定规则，得到一个6位或者8位数字(位数太多的话不方便用户输入，太少的话又容易被暴力猜测到)；

C#实现基于HMAC的OTP的代码 :  

```csharp
public static string HOTP(byte[] key, byte[] counter, int length = 6)
{
    var hmac = counter.ToHMACSHA1(key);

    var offset = hmac[hmac.Length - 1] & 0xF;

    var b1 = (hmac[offset] & 0x7F) << 24;
    var b2 = (hmac[offset + 1] & 0xFF) << 16;
    var b3 = (hmac[offset + 2] & 0xFF) << 8;
    var b4 = (hmac[offset + 3] & 0xFF);

    var code = b1 | b2 | b3 | b4;

    var value = code % (int)Math.Pow(10, length);

    return value.ToString().PadLeft(length, '0');
}
```

调用一下试试看 :  

```csharp
//密钥key
var key = "lnh_key".ToBytes(Encoding.UTF8);

//计数器
var counter = "lnh_counter".ToBytes(Encoding.UTF8);

//otp6=752378
var otp6 = SecurityHelper.HOTP(key, counter,6);

//otp8=49752378
var otp8 = SecurityHelper.HOTP(key, counter, 8);
```

其中key是HOTP算法需要的一个密钥(不可泄露)；counter是每次生成HOTP的时候使用的计数器，使用一次就更换一个。然后就可以用来生成OTP了，第一此截取了6位，第二此截取了8位。

# 3 TOTP 基于时间的一次性密码 {#3-time-based-one-time-password}

TOTP是Time-Based One Time Password的缩写。TOTP是在HOTP的基础上扩展的一个算法，算法细节定义在RFC6238(<https://tools.ietf.org/html/rfc6238>)，其核心在于把HOTP中的counter换成了时间T，可以简单的理解为一个当前时间的时间戳(unixtime)。一般实际应用中会固定一个时间的步长，比如30秒，60秒，120秒等等，也就是说再这个步长的时间内，基于TOTP算法算出的OTP值是一样的。废话不多说，看看TOTP算法的核心代码 :  

```csharp
public static string TOTP(byte[] key, int step = 60, int length = 6)
{
    var unixTime = (DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc)).TotalSeconds;
    var counter = ((int)unixTime) / step;
    var counterBytes = BitConverter.GetBytes(counter);
    return HOTP(key, counterBytes, length);
}
```

调用一下试试看 :  

```csharp
//密钥key
var key = "lnh_key".ToBytes(Encoding.UTF8);

//在10秒内生成，otp是一样的
for (var i = 0; i < 100; i++)
{
    var otp = SecurityHelper.TOTP(key, 10, 6);
    Console.WriteLine(otp);
    Thread.Sleep(1000);
}
```
![基于时间的一次性密码](totp-result.png)

# 4 身份认证 {#4-identity-authentication}

首先解释下什么是身份认证？其实很简单，就是让对方相信你就是你。那么如何让对方相信你就是你呢？按照你能提供的信息的等级来划分，大致有如下三种信息可以证明你就是你自己 :  

1. 你所`知道`的信息 : 比如我们最广泛使用的**用户名+密码**，因为只有你自己知道**用户名+密码**这个信息组合，那么当你把这个组合提供给我的时候，我就可以相信你就是你。
2. 你所`拥有`的信息 : 假如你的**用户名+密码**泄露给了第三方，这个时候你就会有被第三方冒充的危险了。怎么办呢，再进一步提供一个只有**你自己拥有的信息**，即可防止被第三方冒充的危险。
3. 你所`独有`的信息 : 再假设一下，你拥有的信息也被泄露给了第三方，这个时候你又会面临被冒充的危险。再进一步，提供一个只有**你自己所独有的的信息**，比如你的指纹，虹膜，面部特征等等。

## 4.1 2SV 两步验证(Two Steps Verification) {#4-1-two-steps-verification}

两步验证现在是一个再加强认证安全方面广泛使用的一个解决方案。比如Google的2SV(<https://www.google.com/landing/2step/>)，Microsoft的2SV(<https://support.microsoft.com/zh-cn/help/12408/microsoft-account-about-two-step-verification>)等等，通常的做法是当用户输入了**用户名+密码**的基础上，会让用户再提供一个**一次性密码**(以短信、邮件，或者动态密码生成器app的方式发放给用户)。再有比如在一些服务中需要用户额外设置的安全问题，比如**你的出生地在哪？**等等此类。

## 4.2 2FA 双因素认证(Two Factor Authentication) {#4-2-two-factor-authentication}

2SV有个孪生兄弟2FA(双因素认证 :  Two Factor Authentication)，那么关于2SV和2FA有什么区别呢，比如让用户在**用户名+密码**的基础上提供的额外的**一次性密码**，关于这个**一次性密码**到底是属于**你所知道的信息**还是**你所拥有的信息**呢？并没有明显的区分界限，有兴趣的可以看看这里的讨论 :<https://security.stackexchange.com/questions/41939/two-step-vs-two-factor-authentication-is-there-a-difference>。 如果你觉得这个一次性密码属于**你所知道的信息**，那么你可以认为它是2SV；如果你觉得这个一次性密码属于**你所拥有的信息**，那么你可以认为它是2FA。

总结来说，2FA就是使用了身份认证中的2个要素。

# 5 总结 {#5-summary}

简单的介绍了下一次性密码的原理以及其应用场景。如有错误之处，欢迎指正！

# 6 参考资料 {#6-reference}

OTP(One Time Password)Wiki :  https://en.wikipedia.org/wiki/One-time_password

One Time Password System :  https://tools.ietf.org/html/rfc2289

HOTP(HMAC-Based One Time Password) Wiki :  https://en.wikipedia.org/wiki/HMAC-based_One-time_Password_Algorithm

HOTP(HMAC-Based One Time Password)RFC :  https://tools.ietf.org/html/rfc4226

TOTP(Time-Based One Time Password)Wiki :  https://en.wikipedia.org/wiki/Time-based_One-time_Password_Algorithm

TOTP(Time-Based One Time Password)RFC :  https://tools.ietf.org/html/rfc6238

2SV vs 2FA (1) :  https://security.stackexchange.com/questions/41939/two-step-vs-two-factor-authentication-is-there-a-difference

2SV vs 2FA (2) :  https://paul.reviews/the-difference-between-two-factor-and-two-step-authentication/

MFA/2FA(Multi Factor Authentication) Wiki :  https://en.wikipedia.org/wiki/Multi-factor_authentication

## 6.1 示例 {#6-1-example}

Google Authenticator : https://github.com/google/google-authenticator/wiki

Example: https://authenticator.ppl.family/


[消息认证码]:../01-cryptography-toolbox-1/#4-message-authentication-code
