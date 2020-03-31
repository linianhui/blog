---
title: '[K8S] 核心概念 04 - Service'
created_at: 2020-03-31 17:37:01
tag: ["K8S", "Pod", "Service", "EndPoints"]
toc: true
---

# 1. 概述 {#overview}

# 2. EndPoints {#endPoints}

抽象层面 : `EndPoints = n * (Pod = random-ip:fixed-port)`。

# 3. Service {#service}

抽象层面 : `Service = service-name + EndPoints = fixed-vip:fixed-port`

## 3.2 Service without selectors {#service-without-selectors}

不使用`selectors`, 手动创建同名的`Endpoints`。

```yml
apiVersion: v1
kind: Endpoints
metadata:
  name: mysql
subsets:
  - addresses:
      - ip: 192.0.2.42
    ports:
      - port: 3306
```

```yml
apiVersion: v1
kind: Service
metadata:
  name: mysql
spec:
  ports:
    - protocol: TCP
      port: 3306
      targetPort: 3306
```

然后其他的`Pod`内部就可以使用`mysql:3306`来访问了。
