---
title: '[代码规范] HTTP APIs 设计/规范指南'
created_at: 2018-03-31 09:02:21
tag: ["REST", "HTTP", "API", "JSON", "URL", "资源", "表述", "i18n", "命名规则", "设计指南"]
toc: true
---

根据REST APIs的成熟度模型 ，此规范关注的是`Level 2`的APIs。
![REST APIs 成熟度模型](richardson-maturity-model.png)  

# 1 设计指南 {#1-design-guide}

HTTP APIs主要由四部分组成 : [#4 HTTP](#4-http), [#5 URL](#5-url), `资源`，`资源的表述`。

> 资源的表述通常都采用[#6 JSON](#6-json)格式，故而下文使用[#6 JSON](#6-json)代指`资源的表述`。

根据这些组成部分，按照以下**3**个步骤设计APIs。

## 1.1 基于`资源`设计API {#1-1-resource-based-design-api}

设计HTTP APIs的首要任务是识别出业务领域中的资源。资源是对服务端提供的服务进行分解、组合后的一个被命名的抽象概念。

> 有很重要一点需要明确 : 资源`≠`数据表，它们两个之间并没有直接的映射关系。如果直接把数据存储结构映射为资源，则只会让资源无法有效的表达业务需要，也会造成资源本身和底层存储的紧耦合。

资源的设计是以`名词`为中心的。比如`今天的天气`是一个资源; 而**获取今天的天气**则不是，它代表的是对`今天的天气`资源的一个读取操作。基于此我们可以抽象出来一个`天气`的资源。

## 1.2 基于`URL`标识`资源` {#1-2-identify-resources-based-on-url}

识别出`资源`后，则需要为其分配一个[#5 URL](#5-url)进行标识。

1. 一个`资源`可以有多个[#5 URL](#5-url)。
2. 一个[#5 URL](#5-url)只能标识一个`资源`。

> 总结来说就是`资源 : URL`的关系就是`1 : N`的关系。

比如上面提到的`天气`和`今天的天气`这两个资源，可以用如下的[#5 URL](#5-url)进行标识。

| 资源       | URL                                     |
| ---------- | --------------------------------------- |
| 天气       | `/weather`                              |
| 今天的天气 | `/weather/today`                        |
| 今天的天气 | `/weather/2018-04-01`，今天是2018-04-01 |

`资源名`(资源的名字)体现在[#5 URL](#5-url)中的`Path`部分。

>关于`资源名`采用单数还是复数的问题，这里统一为单数（即使代表的是一个集合资源）。原因有 **3** : 
>
>    1. 一致性 : 中文中并无复数的概念，可保持一致。
>    2. 无二义性 : 比如news，既是单数也是复数。所以就不必追求它们的单数或者复数形式形式；基于同样的原则，那么原本就是单数的名词，也无需刻意追求复数形式。
>    3. 简单性 : 英文名词的复数形式并不统一（比如order > orders, history > histories）,使用单数可以避免团队成员对于这些差异的不同理解与争执。

`资源`存在子资源的情况下，可以把子资源提升为顶层的资源。比如有一个订单资源`/order/{order_id}`，订单中包含2件物品。

```
# 不推荐 单个子资源
/order/{order_id}/item/{item_id}

# 推荐 单个子资源
/order-item/{order_item_id}

# 推荐 子资源集合
/order/{order_id}/item
```

## 1.3 基于`HTTP`和`JSON`操作`URL`标识的`资源` {#1-3-operate-on-url-identified-resources-based-on-http-and-json}

在标识出`资源`以后，就可以使用[#4 HTTP](#4-http)通过[#6 JSON](#6-json)来操作资源了。

1. 使用[#4-1 HTTP Method](#4-1-http-method)来映射对资源的操作请求（CRUD或者其他）。
2. 使用[#4-2 HTTP Header](#4-2-http-header)携带请求/响应所需的元数据信息。
3. 使用[#4-3 HTTP Stauts Code](#4-3-http-status-code)表示**HTTP协议层面**的响应状态。
4. 使用[#6 JSON](#6-json)作为数据交换格式。



# 2 版本化 {#2-versioning}

在`Level 2`的HTTP APIs中，虽然我们推荐也努力使得我们的APIs不做不兼容的改动，但是依然无法彻底的避免不兼容的升级。这就使得我们不得不对APIs进行版本化管理。通常有以下 **3** 种方案 : 

1. URL
    ```http
    GET http://api.linianhui.com/v1/weather HTTP/1.1
    ```
2. Request Header
    ```http
    GET http://api.linianhui.com/weather HTTP/1.1
    Api-Version: v1
    ```
3. Request Header (Accept Header)
    ```http
    GET http://api.linianhui.com/weather HTTP/1.1
    Accept: application/vnd.v1+json
    ```

**在`Level 2`的API中优先推荐使用方案1(`URL`)**。理由是其更直观，便于实现，便于日志追踪。




# 3 命名规则 {#3-name-case}

| 规则名称                    | 说明                  | 取值范围    |
| --------------------------- | --------------------- | ----------- |
| `all-lower-hyphen-case`     | 采用`-`分隔符的全小写 | `a-z 0-9 -` |
| `all_lower_underscore_case` | 采用`_`分隔符的全小写 | `a-z 0-9 _` |
| `ALL_UPPER_UNDERSCORE_CASE` | 采用`_`分隔符的全大写 | `A-Z 0-9 _` |

## 3.1 URL {#3-1-name-case-url}

| URL组件   | 命名规则                    |
| --------- | --------------------------- |
| scheme    | `all-lower-hyphen-case`     |
| authority | `all-lower-hyphen-case`     |
| path      | `all-lower-hyphen-case`     |
| query     | `all_lower_underscore_case` |
| fragment  | `all-lower-hyphen-case`     |

URL的query部分是`name=value`而不是`key=value`，URL支持name重复存在，Web服务端框架绝大部分都支持直接映射为数组。

此外命名规则约束的是`name`部分，而不关心`value`部分，`value`部分应该采用`urlencode`进行编码。示例 :

```http
https://api.my-server.com/v1/user-stories?dipplay_names=abc&display_names=efg
```

服务端会得到一个类型为数组的`dispaly_names`参数。
```json
display_names = [
  "abc",
  "efg"
];
```

## 3.2 JSON {#3-2-name-case-json}

| JSON             | 命名规则                    |
| ---------------- | --------------------------- |
| filed_name       | `all_lower_underscore_case` |
| filed_value      | 无要求                      |
| ENUM_FILED_VALUE | `ALL_UPPER_UNDERSCORE_CASE` |

`ENUM_FILED_VALUE`用于表示枚举字段，用全大写和`_`分隔符，以示和普通的字符串进行区分。示例 :

```json
{
  "first_name":"li",
  "lase_name":"nianhui",
  "gender":"MALE",
  "remark":"描述信息",
  "age":1234
}
```

参考资料 : 

1. https://support.google.com/webmasters/answer/76329
2. https://stackoverflow.com/questions/5543490/json-naming-convention
3. https://tools.ietf.org/html/rfc3986#section-2.4

# 4 HTTP {#4-http}

## 4.1 HTTP Method {#4-1-http-method}

面向资源设计的HTTP APIs中，绝大部分的操作都是`CRUD(Create,Read,Update,Delete)`，都可以映射为某一个[HTTP Method][HTTP-Method]。其余的无法映射的操作一般存在两种解决方案 : 

1. 抽象出新的资源，比如**禁用用户**的操作。假设用户的资源是`/user`，那么可以抽象出来一个被锁定的用户的资源`/user/disabled`。如此以来，
   1. 禁用用户 : `POST /user/disabled`或者`PUT /user/disabled/{user_id}`。
   2. 取消禁用 : `DELETE /user/disabled/{user_id}`。
   3. 获取被禁用的用户列表 : `GET /user/disabled`。
2. 如果上面的方式无法满足需要，则可以采用`POST`和`URL/动词`的组合。还拿上面的举例 : 
   1. 禁用用户 : `POST /user/{user_id}/disable`或者`PUT /user/{user_id}/disable`。
   2. 取消禁用 : `DELETE /user/{user_id}/disable`。
   3. 获取被禁用的用户列表 : `GET /user?status=DISABLED`。

### 4.1.1 Names {#4-1-1-http-method-names}

| HTTP Method Name             | Safe | Idempotent | 描述说明                                     |
| ---------------------------- | :--- | ---------- | -------------------------------------------- |
| [GET][HTTP-Method-GET]       | ✔    | ✔          | 获取一个资源                                 |
| [PUT][HTTP-Method-PUT]       | ✘    | ✔          | 更新或创建一个资源（完整替换）               |
| [PATCH][HTTP-Method-PATCH]   | ✘    | ✘          | 更新一个资源（部分更新）                     |
| [DELETE][HTTP-Method-DELETE] | ✘    | ✔          | 删除一个资源                                 |
| [POST][HTTP-Method-POST]     | ✘    | ✘          | 创建，或者不满足以上四个Method语义的所有操作 |

[PATCH][HTTP-Method-PATCH]和[POST][HTTP-Method-POST]都是`不安全`且`不幂等`的，差异在于[PATCH][HTTP-Method-PATCH]仅是用于部分更新资源, 而且是一个可选支持的[HTTP Method][HTTP-Method]，可能会存在一些代理、网关等组件不支持的情况，所以推荐用[POST][HTTP-Method-POST]来代替它。

### 4.1.2 Semantics {#4-1-2-http-method-semantics}

每一个[HTTP Method][HTTP-Method]都具有一下3个HTTP协议层面的语义。

| HTTP Method Semantics                          | 含义                                     |
| ---------------------------------------------- | ---------------------------------------- |
| [Safe][HTTP-Method-Semantics-Safe]             | 操作不会对资源产生副作用，不会修改资源。 |
| [Idempotent][HTTP-Method-Semantics-Idempotent] | 执行一次和重复执行N次，结果是一样的。    |
| [Cacheable][HTTP-Method-Semantics-Cacheable]   | 可以被缓存。                             |

参考资料 : 

1. https://tools.ietf.org/html/rfc7231#section-4
2. https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods

[HTTP-Method]:https://tools.ietf.org/html/rfc7231#section-4
[HTTP-Method-GET]:https://tools.ietf.org/html/rfc7231#section-4.3.1
[HTTP-Method-POST]:https://tools.ietf.org/html/rfc7231#section-4.3.3
[HTTP-Method-PUT]:https://tools.ietf.org/html/rfc7231#section-4.3.4
[HTTP-Method-DELETE]:https://tools.ietf.org/html/rfc7231#section-4.3.5
[HTTP-Method-PATCH]:https://tools.ietf.org/html/rfc5789
[HTTP-Method-Semantics-Safe]:https://tools.ietf.org/html/rfc7231#section-4.2.1
[HTTP-Method-Semantics-Idempotent]:https://tools.ietf.org/html/rfc7231#section-4.2.2
[HTTP-Method-Semantics-Cacheable]:https://tools.ietf.org/html/rfc7231#section-4.2.3


## 4.2 HTTP Header {#4-2-http-header}

Http Header的用途在于携带`HTTP Request`和`HTTP Response`的元数据信息。

格式为`Name:Value` : Name不区分大小写，通常都采用首字母大写，`-`分隔的写法，比如`Content-Type`。按其用途可以分为如下4类 : 

1. 通用类 : 描述请求和响应的。
2. 请求类 : 描述请求的。
3. 响应类 : 描述响应的。
4. 表述类 : 描述请求和响应的`Body`部分的。

HTTP APIs中常用到的Headers : 

| HTTP Header Name                                 | 描述说明                             | 示例                            |
| ------------------------------------------------ | ------------------------------------ | ------------------------------- |
| [Accept][HTTP-Header-Accept]                     | 客户端期望服务器返回的数据格式。     | `Accept:application/json`       |
| [Accept-Charset][HTTP-Header-Accept-Charset]     | 客户端期望服务器返回的数据的字符集。 | `Accept-Charset:utf-8`          |
| [Content-Type][HTTP-Header-Content-Type]         | 描述`Body`的数据类型。               | `Content-Type:application/json` |
| [Content-Encoding][HTTP-Header-Content-Encoding] | 描述`Body`的编码方式。               | `Content-Encoding: gzip`        |
| [Content-Length][HTTP-Header-Content-Length]     | 描述`Body`的长度。                   | `Content-Length: 1234`          |
| [Location][HTTP-Header-Location]                 | `Response`中提供给客户端的连接       | `Location: /user/1`             |

HTTP Request:
```http
POST /xxx HTTP/1.1
Accept: application/json;
Accept-Charset: utf-8
Content-Type: application/json;charset=utf-8

{
  "x":1,
  "y":2
}
```

HTTP Response:
```http
HTTP/1.1 201 Created
Content-Type: application/json;charset=utf-8
Content-Encoding: gzip
Location: /xxx/1
Request-Id: {id}
```

`Request-Id`可以由`Http Request`传入，也可以由服务端生成，追加此信息到`log`中，便于服务端追踪请求。

参考资料 : 

1. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
2. https://tools.ietf.org/html/rfc7231#section-5
3. https://tools.ietf.org/html/rfc7231#section-7

[HTTP-Header-Accept]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept
[HTTP-Header-Accept-Charset]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Charset
[HTTP-Header-Content-Type]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type
[HTTP-Header-Content-Encoding]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding
[HTTP-Header-Content-Length]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length
[HTTP-Header-Location]:https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location


## 4.3 HTTP Stauts Code {#4-3-http-status-code}

[HTTP Status Code][HTTP-Status-Code]用来指示`HTTP协议层面的请求状态`。它由一个数字和一个描述消息构成，比如`200 OK`。有以下几类状态码 : 

1. `2xx` : 执行成功。
2. `4xx` : 客户端的错误，通常情况下客户端需要修改请求然后再次发送请求。
3. `5xx` : 服务端的错误。

| HTTP Status Code                                   | 描述说明                                                                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [200 OK][HTTP-Status-Code-200]                     | 执行成功。                                                                                                                                  |
| [201 Created][HTTP-Status-Code-201]                | 资源创建成功，应该在`HTTP Response Header`中返回`Location`来提供新创建资源的URL地址。                                                       |
| [202 Accepted][HTTP-Status-Code-202]               | 服务端已经接受了请求，但是并未处理完成，适用于一些异步操作。                                                                                |
| [204 No Content][HTTP-Status-Code-204]             | 执行成功，但是不会在`HTTP Response Body`中放置数据。                                                                                        |
| [400 Bad Request][HTTP-Status-Code-400]            | 客户端请求错误，客户端应该根据`HTTP Response Body`中的错误描述来修改请求，然后才能再次发送。                                                |
| [401 Unauthorized][HTTP-Status-Code-401]           | 客户端未提供授权信息。                                                                                                                      |
| [403 Forbidden][HTTP-Status-Code-403]              | 客户端无权访问（客户端可能已经提供了授权信息，但是权限不够）。如果出于信息隐藏的目的，也可以使用`404 Not Found`来替代。                     |
| [404 Not Found][HTTP-Status-Code-404]              | 客户端请求的资源不存在。                                                                                                                    |
| [405 Method Not Allowed][HTTP-Status-Code-405]     | 客户端使用了不被允许的HTTP Method。比如某一个URL只允许`POST`,但是客户端采用了`GET`。                                                        |
| [406 Not Acceptable][HTTP-Status-Code-406]         | 客户端发送的`Accept`不被支持。比如客户端发送了`Accept:application/xml`，但是服务器只支持`Accept:application/json`。                         |
| [409 Conflict][HTTP-Status-Code-409]               | 客户端提交的数据过于陈旧，和服务端的存在冲突，需要客户端重新获取最新的资源再发起请求。                                                      |
| [415 Unsupported Media Type][HTTP-Status-Code-415] | 客户端发送的`Content-Type`不被支持。比如客户端发送了`Content-Type:application/xml`，但是服务器只支持`Content-Type:application/json`。       |
| [429 Too Many Requests][HTTP-Status-Code-429]      | 客户端在指定的时间内发送了太多次数的请求。用于限速，比如只允许客户端在1分钟内发送100次请求，客户端在发送101次请求的时候，会得到这样的响应。 |
| [500 Internal Server Error][HTTP-Status-Code-500]  | 服务器遇见了未知的内部错误。                                                                                                                |
| [501 Not Implemented][HTTP-Status-Code-501]        | 服务器还未实现次功能。                                                                                                                      |
| [503 Service Unavailable][HTTP-Status-Code-503]    | 服务器繁忙，暂时无法处理客户端的请求。                                                                                                      |

参考资料 : 

1. https://tools.ietf.org/html/rfc7231#section-6
2. https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
3. https://httpstatuses.com/

[HTTP-Status-Code]:https://tools.ietf.org/html/rfc7231#section-6
[HTTP-Status-Code-200]:https://tools.ietf.org/html/rfc7231#section-6.3.1
[HTTP-Status-Code-201]:https://tools.ietf.org/html/rfc7231#section-6.3.2
[HTTP-Status-Code-202]:https://tools.ietf.org/html/rfc7231#section-6.3.3
[HTTP-Status-Code-204]:https://tools.ietf.org/html/rfc7231#section-6.3.5
[HTTP-Status-Code-400]:https://tools.ietf.org/html/rfc7231#section-6.5.1
[HTTP-Status-Code-401]:https://tools.ietf.org/html/rfc7235#section-3.1
[HTTP-Status-Code-403]:https://tools.ietf.org/html/rfc7231#section-6.5.3
[HTTP-Status-Code-404]:https://tools.ietf.org/html/rfc7231#section-6.5.4
[HTTP-Status-Code-405]:https://tools.ietf.org/html/rfc7231#section-6.5.5
[HTTP-Status-Code-406]:https://tools.ietf.org/html/rfc7231#section-6.5.5
[HTTP-Status-Code-409]:https://tools.ietf.org/html/rfc7231#section-6.5.8
[HTTP-Status-Code-415]:https://tools.ietf.org/html/rfc7231#section-6.5.13
[HTTP-Status-Code-429]:https://tools.ietf.org/html/rfc6585#section-4
[HTTP-Status-Code-500]:https://tools.ietf.org/html/rfc7231#section-6.6.1
[HTTP-Status-Code-501]:https://tools.ietf.org/html/rfc7231#section-6.6.2
[HTTP-Status-Code-503]:https://tools.ietf.org/html/rfc7231#section-6.6.4


## 4.4 HTTP Error Response {#4-4-http-error-response}

虽然[#4-3 HTTP Stauts Code](#4-3-http-status-code)有`4xx`和`5xx`的状态码来表示哪里出错了，但是其代表的只是`HTTP协议层面`的错误描述，它无法提供和业务相关的更具体错误描述。基于此种情况，我们需要设计一套描述业务层面错误的数据结构 : 

```json
[
  {
    "error": "user_name",
    "message": "用户名不能为空。"
  },
  {
    "error": "age",
    "message": "用户年龄不能小于0。"
  }
]
```

这个数据结构仅在状态码为`4xx`和`5xx`出现的时候才会使用；`2xx`的时候则不包含此数据结构。

`error`字段可以是一些出错的字段名、某一错误类别（比如`no_permission`）等等。
```json
[
  {
    "error": "no_permission",
    "message": "没有user.delete的权限"
  }
]
```

参考资料 : 

1. Problem Details for HTTP APIs : https://tools.ietf.org/html/rfc7807

# 5 URL {#5-url}

URL遵循[RFC3986]规范，由以下几部分组成。

<pre>
  https://api.linianhui.test:8080/user/disabled?first_name=li#title
  \___/  \______________________/\_____________/\___________/\____/
    |               |                   |             |          |
  scheme        authority              path         query    fragment
</pre>

URL的命名规则[#3-1 URL](#3-1-name-case-url)。

参考资料 : 

1. https://tools.ietf.org/html/rfc3986

[RFC3986]:https://tools.ietf.org/html/rfc3986

# 6 JSON {#6-json}

[#6 JSON]是一种应用非常广泛的数据交换格式。其包含6种基本的数据类型。

| JSON数据类型 | 示例       |
| ------------ | ---------- |
| `string`     | "lnh"      |
| `number`     | 1.23       |
| `array`      | [...]      |
| `object`     | {...}      |
| `bool`       | true/false |
| `null`       | null       |

1. JSON的命名规则[#3-2 JSON](#3-2-name-case-json)。
2. JSON中没有原生的日期和时间类型，应该遵循[#7 Date Time](#7-date-time)的要求，使用`string`类型表示。
3. JSON中出现的和国际化相关的数据遵循[#8 i18n](#8-i18n)中的要求。
4. `null`值的字段不能忽略掉，应该显式的表示为`"field_name":null`。

JSON示例 : 
```json
{
  "first_name": "li",
  "lase_name": "nianhui",
  "gender": "MALE",
  "age": 123,
  "tags": ["coder"],
  "is_admin": true,
  "address": null,
  "country_code":"CN",
  "currency_code":"CNY",
  "language_code":"zh",
  "locale_code":"zh-CN",
  "created_at":"2018-01-02T03:04:05.128Z+08:00",
  "time_zone":"+08:00"
}
```

参考资料 :

1. http://json.org/
2. https://tools.ietf.org/html/rfc7159

[#6 JSON]:http://json.org/


# 7 Date Time {#7-date-time}

日期和时间采用[RFC3339]中定义的通用的格式。表示方法如下 : 

| 格式             | 组成部分                                             | 示例                           |
| ---------------- | ---------------------------------------------------- | ------------------------------ |
| `date-fullyear`  | 4位数的年份                                          | 2018                           |
| `date-month`     | 2位数的月份                                          | 04                             |
| `date-mday`      | 2位数的日期                                          | 01                             |
| `time-hour`      | 2位数的小时                                          | 02                             |
| `time-minute`    | 2位数的分钟                                          | 08                             |
| `time-second`    | 2位数的秒数                                          | 59                             |
| `time-secfrac`   | 秒的分数部分                                         | .256                           |
| `time-numoffset` | `+`/`-` `time-hour`:`time-minute`                    | +08:00                         |
| `time-offset`    | `Z`/`time-numoffset`                                 | Z+08:00                        |
| `partial-time`   | `time-hour`:`time-minute`:`time-second time-secfrac` | 02:08:59.256                   |
| `full-date`      | `date-fullyear`-`date-month`-`date-mday`             | 2018-04-01                     |
| `full-time`      | `partial-time time-offset`                           | 02:08:59.256+08:00             |
| `date-time`      | `full-date`T`full-time`                              | 2018-04-01T02:08:59.256Z+08:00 |

扩展 : `date-fullyear-month`(年月)可表示为`date-fullyear`-`date-month`，比如`2018-04`。

1. 日期和时间应该满足上面表格中定义的格式。
2. 优先采用UTC时间（即Z+00:00）。即使没有跨时区的要求，也必须携带时区偏移信息，比如`2018-04-01T02:08:59.256Z+08:00`。


参考资料 : 

1. Date and Time Formats - ISO 8601 : https://www.w3.org/TR/NOTE-datetime
2. Date and Time on the Internet: Timestamps ( RFC 3339 )  : https://tools.ietf.org/html/rfc3339#section-5.6


[RFC3339]:https://tools.ietf.org/html/rfc3339

# 8 i18n {#8-i18n}

国家代码 : 采用[Country Code]`ISO 3166 alpha-2`版本（2个字母）。示例 : 

1. 中国 : `CN`
2. 美国 : `US`
3. 其他 : https://en.wikipedia.org/wiki/ISO_3166-2#Current_codes


货币代码 : 采用[Currency Code]`ISO 4217:2015`版本（3个字母）。示例 : 

1. 人民币 : `CNY`
2. 美元 : `USD`
3. 其他 : https://en.wikipedia.org/wiki/ISO_4217#Active_codes


语言代码 : 采用[Language Code]`ISO 639-1:2002`版本（2个字母）。示例 : 

1. 中文 : `zh`
2. 英文 : `en`
3. 其他 : https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes


区域代码 : 由[Language Code]和[Country Code]组合而成。示例 : 

1. `zh-CN`
2. `en-US`

参考资料 : 

1. https://www.iso.org/iso-3166-country-codes.html
2. https://www.iso.org/iso-4217-currency-codes.html
3. https://www.iso.org/iso-639-language-codes.html

[Country Code]:https://www.iso.org/iso-3166-country-codes.html
[Currency Code]:https://www.iso.org/iso-4217-currency-codes.html
[Language Code]:https://www.iso.org/iso-639-language-codes.html


# 9 其他 {#9-other}

待完善...

## 9.1 HTTP Request 公共查询参数

| 参数用途 | 参数名                                      | 取值范围                                              |
| -------- | ------------------------------------------- | ----------------------------------------------------- |
| 分页     | `page`<br/>`page_size`                      | >=1                                                   |
| 排序     | `sort`                                      | `{field_name}\|{asc\|desc},{field_name}\|{asc\|desc}` |
| 区间     | `{field_name}_begin`<br/>`{field_name}_end` | 无要求                                                |
| 时间     | `{field_name}_at`                           | 无要求                                                |

示例:

```http
GET /user
    ?page=2
    &page_size=10
    &sort=name,age|desc
    &created_at_begin=2018-01-01
    &created_at_end=2018-06-01
```

上面的查询代表的含义 : 按照`name`升序和`age`倒序的排序方式；获取`created_at`时间位于`2018-01-01`和`2018-06-01`区间内；按照每页`10`条数据，获取第`2`页的数据。

## 9.2 HTTP Response 分页数据结构

在分页请求的时候，API会返回分页后的数据和分页的信息。

```json
{
  "page": 2,
  "page_size": 10,
  "total_count": 100,
  "items":[
    {...},
    {...},
  ]
}
```


# 10 示例 {#10-example}

... 待补充


# 11 参考资料 {#11-reference}

本人的解读REST系列博客 : [理解REST](/understand-rest/)

REST APIs 成熟度模型 : https://martinfowler.com/articles/richardsonMaturityModel.html

PayPal的API设计指南 : https://github.com/paypal/api-standards

REST架构风格的出处 : 架构风格与基于网络的软件架构设计(by [Roy Thomas Fielding](http://www.ics.uci.edu/~fielding/))论文。

1. 英文版 :  https://www.ics.uci.edu/~fielding/pubs/dissertation/top.htm
2. 中文版 :  https://www.infoq.cn/article/web-based-apps-archit-design/

HTTP APIs 四大组成部分（HTTP, URI, MIME, JSON）

1. HTTP/1.1 ( RFC7230-7235 )  : https://tools.ietf.org/html/rfc7230
2. URI ( RFC 3986 )  : https://tools.ietf.org/html/rfc3986
3. MIME ( RFC 2387 ) : https://tools.ietf.org/html/rfc2387
4. JSON : http://json.org/

Hypermedia

1. JSON Schema: http://json-schema.org/

URL模板

1. URI Template ( RFC6570 )  : https://tools.ietf.org/html/rfc6570
