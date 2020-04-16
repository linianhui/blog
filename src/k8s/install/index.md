---
title: '[K8S] Install'
created_at: 2018-12-13 23:21:01
tag: ["K8S", "kubeadm","flannel"]
toc: true
---

kubeadm是k8s的command-line工具，用来创建和维护k8s集群。

# 1. 前提要求 {#requirements}

| role   | hostname     | fixed ip      | os                    | cpu  | memory |
| :----- | :----------- | :------------ | :-------------------- | :--- | :----- |
| master | k8s-master-1 | 192.168.2.220 | ubuntu server 18.04.4 | 2    | 4G     |
| worker | k8s-worker-1 | 192.168.2.221 | ubuntu server 18.04.4 | 2    | 4G     |
| worker | k8s-worker-2 | 192.168.2.222 | ubuntu server 18.04.4 | 2    | 4G     |

## 1.1 硬件要求 {#requirements-hardware}

1. 至少2核CPU。
2. 至少2G的内存。
3. 每个node都有固定的IP，并且可以直联（无NAT）。

```bash
# 查看CPU核心数
cat /proc/cpuinfo | grep  processor | wc -l

# 查看内存大小
free -h

# 查看ip
ip a
```

## 1.2 软件要求 {#requirements-hostnam-unique} 

1. hostname唯一，并且不包含`.`、`_`和大写字母。
2. 为k8s相关的服务配置防火墙，这里图省事，直接关闭防火墙。
3. 关闭Swap内存（k8s为了性能考虑，不允许开启Swap）。

{{<highlight-file file="1.prerequisites.sh" lang="bash">}}


# 2. 安装Docker {#instll-docker}

[安装Docker][docker-install]

# 3. 安装Kubeadm {#install-docker}

{{<highlight-file file="2.kubeadm.install.sh" lang="bash">}}

# 4. 初始化Master节点 {#master-init}

上述步骤需要在每个node上都执行。本步骤只需在master上执行即可。集群配置文件

{{<highlight-file file="kubeadm.init-config.yml" lang="yml">}}

初始化命令:
```bash
wget https://linianhui.github.io/k8s/install/kubeadm.init-config.yml

kubeadm init --config kubeadm.init-config.yml --upload-certs -v=5
```

成功后会查看node:
```bash
kubectl get nodes

# 输出
NAME           STATUS     ROLES    AGE   VERSION
k8s-master-1   NotReady   master   5m    v1.18.1
```

# 5. 部署网络插件 

部署`flannel`网络插件。

```bash
kubectl apply -f https://linianhui.github.io/k8s/install/flannel.yml
```

参考 : 
1. https://github.com/coreos/flannel

# 6. 部署dashboard

部署`metrics-server`和`dashboard`。

```bash
# 检查flannel是否部署完成，部署完成后再部署dashboard。 
kubectl get pods -A

# 部署监控服务
kubectl apply -f https://linianhui.github.io/k8s/install/metrics-server.yml
# 部署dashboard
kubectl apply -f https://linianhui.github.io/k8s/install/dashboard.yml
```

部署完成后dashboard的端口号为`30080`。笔者的地址为 : <http://192.168.2.220:30080>

```bash
# 获取访问dashboard的token
kubectl -n kube-dashboard describe secret kube-dashboard-admin-token
```

参考 :
1. https://github.com/kubernetes-sigs/metrics-server
2. https://github.com/kubernetes/dashboard

# 7. 初始化Worker节点 {#worker-join}

本步骤只需在worker上执行即可。使用上步中输出的信息。
```bash
# 在master上执行，获取kubeadm join命令
kubeadm token create --print-join-command

# 示例kubeadm join命令
kubeadm join api-server.k8s.test:6443 --token opomfo.nd0dkto8ye006hda --discovery-token-ca-cert-hash sha256:da3764c85a4727de39d674f93a976c617f15f49ca11b2a68bc850c5789
```

# 8. Reference {#reference}

{{<file-list regularExpression="^.*\.sh$">}}

{{<file-list regularExpression="^.*\.yml$">}}

https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init

https://kuboard.cn/install/install-k8s.html

[docker-install]:/docker/install
