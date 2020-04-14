---
title: '[K8S] kubeadm'
created_at: 2018-12-13 23:21:01
tag: ["K8S", "kubeadm"]
aliases: ["/k8s/install"]
toc: true
---

kubeadm是k8s的command-line工具，用来创建和维护k8s集群。

# 0. 准备环境 {#requirements}

| role   | hostname     | fixed ip      | os                    | cpu  | memory |
| :----- | :----------- | :------------ | :-------------------- | :--- | :----- |
| master | k8s-master-1 | 192.168.2.220 | ubuntu server 18.04.4 | 2    | 4G     |
| worker | k8s-worker-1 | 192.168.2.221 | ubuntu server 18.04.4 | 2    | 4G     |
| worker | k8s-worker-2 | 192.168.2.222 | ubuntu server 18.04.4 | 2    | 4G     |

# 1. 安装Master节点 {#master}

安装命令:
```bash
kubeadm init --config kubeadm.init-config.yml --upload-certs
```

可以通过`kubeadm config print init-defaults`命令查看默认的配置，然后修改为自己的`kubeadm.init-config.yml`即可。以下是一个修改后的示例：

{{<highlight-file file="kubeadm.init-config.yml" lang="yml">}}

# 2. 安装网络插件 {#network}


# 3. 安装Worker节点 {#worker}


# 3. Script File List {#script-file-list}

{{<file-list regularExpression="^.*\.sh$">}}

# 4. Reference {#reference}

https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init

https://kuboard.cn/install/install-k8s.html
