---
title: '[K8S] 核心概念 01 - 概述'
created_at: 2020-03-31 12:03:01
tag: ["k8s","api-server","etcd","kubelet","kubeproxy","draft"]
toc: true
draft: true
---

k8s是一个开源的容器编排系统，源自于Google15年的运维经验[^borg]。具备一下几个特点：
1. 自动化的上线和回滚。
2. 服务发现和负载均衡。
3. 水平扩展。
4. 自我修复。
5. 配置管理。
6. 管理容器资源。

# 1 component {#component}

一个k8s集群是由一组worker node和管理它们的control plane以及一些插件构成。

## 1.1 control plane {#control-plane}

控制面板掌控整个集群的调度管理，是整个集群的大脑。主要有一下4个组件构成：
1. `api-service`：一组REST APIs，它是管理k8s集群的唯一入口，同时也是各个组件交互时的桥梁。
2. `etcd`：高可用的KV数据库，用才存储集群的各种数据。
3. `controller-manager`：
4. `scheduler`：根据用户的声明性要求（资源需求，亲和性等等）负责pod的创建和调度。

为了保证其高可用性，控制面板通常是由奇数个(master node)构成，每个节点上部署上述的全部组件，并且不会在这些节点上运行用户容器。

## 1.2 worker node {#worker-node}

工作节点负责运行用户容器。主要由一下2个组件构成：

1. `kubelet`：
2. `kube-proxy`：
3. `container-runtime`：

## 1.3 addon {#addon} 

1. DNS
2. 网络插件
3. dashboard
4. 监控
5. 日志


# 2 运行时架构 {#design-concept}

# 2 设计理念 {#design-concept}





# 4 reference {#reference}

[^borg]:Borg, Omega, and Kubernetes: <https://queue.acm.org/detail.cfm?id=2898444>
