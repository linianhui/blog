---
title: '[K8S] 核心概念 02 - Pod'
created_at: 2020-03-31 12:15:01
tag: ["K8S", "Pod"]
toc: true
---


抽象层面 : `Pod=random_ip:fixed_port`

# 1. 概述 {#overview}

K8S中调度的最小单元。可以简单的类比:

| 平台   | 最小调度单元 |
| :----- | :----------- |
| KVM    | VM           |
| Docker | Container    |
| K8s    | Pod          |

# 2. 容器的资源限制 {#container-resources}

```yml
resources:            # 资源限制
  requests:           # 请求的资源: k8s根据requests来进行pod的调度; HPA进行伸缩时也是根据requests来计算的。
    cpu: '500m'       # 单位=milli(千分之一)。50%vCPU。
    memory: '1024Mi'  # 单位=[M,Mi,G,Gi]。
  limits:             # 被允许使用的资源上限: 超过时Pod被kill。
    cpu: '1'          # 1vCPU
    memory: '2Gi'
```

<https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes>

<https://www.youtube.com/watch?v=mxEvAPQRwhw&list=PLIivdWyY5sqL3xfXz5xJvwzFW_tlQB_GB&index=3>


# 3. 容器的健康检查探针 {#container-probes}

```yml
readinessProbe:            # 启动后检查，检查通过后才能接收流量。
  initialDelaySeconds: 10  # 单位=s。  等待10s后进行检查。
  timeoutSeconds: 10       # 单位=s。  每一次检查超过10s没返回视为失败。
  periodSeconds: 10        # 单位=s。  30s检查一次。
  successThreshold: 1      # 单位=次数。检查1次成功即视为成功。
  failureThreshold: 6      # 单位=次数。检查6次失败即视为失败。
  httpGet:
    scheme: HTTP
    port: 80
    path: /.health-check
livenessProbe:             # 启动后周期性检查，检查失败时则kill Pod。
  initialDelaySeconds: 60
  timeoutSeconds: 10
  periodSeconds: 30
  successThreshold: 1
  failureThreshold: 5
  httpGet:
    scheme: HTTP
    port: 80
    path: /.health-check
```

<https://kubernetes.io/docs/tasks/configure-pod-container/assign-cpu-resource/#specify-a-cpu-request-and-a-cpu-limit>

<https://kubernetes.io/docs/tasks/configure-pod-container/assign-memory-resource/#exceed-a-container-s-memory-limit>

<https://www.youtube.com/watch?v=xjpHggHKm78&list=PLIivdWyY5sqL3xfXz5xJvwzFW_tlQB_GB&index=4>
