---
title: '[K8S] 核心概念 03 - Controller'
created_at: 2020-03-31 17:07:01
tag: ["K8S", "Pod", "Controller","draft"]
toc: true
draft: true
---

# 1. 概述 {#overview}

# 2. ReplicaSet {#replicaset}

抽象层面 : `ReplicaSet = replicas * (Pod = random-ip:fixed-port)`

# 3. Deployment {#deployment}

抽象层面 : `Deployment = New ReplicaSet - Old ReplicaSet`
