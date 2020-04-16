---
title: '[K8S] kubeadm'
created_at: 2018-12-13 23:21:01
tag: ["K8S", "kubeadm"]
aliases: ["/k8s/install"]
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

上述步骤需要在每个node上都执行。本步骤只需在master上执行即可。

初始化命令:
```bash
kubeadm init --config kubeadm.init-config.yml --upload-certs -v=5
```

可以通过`kubeadm config print init-defaults`命令查看默认的配置，然后修改为自己的`kubeadm.init-config.yml`即可。以下是一个修改后的示例：

{{<highlight-file file="kubeadm.init-config.yml" lang="yml">}}

成功后会输出如下信息：
```bash
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

You can now join any number of the control-plane node running the following command on each as root:

  kubeadm join api-server.k8s.test:6443 --token opomfo.nd0dkto8ye006hda \
    --discovery-token-ca-cert-hash sha256:da3764c85a4727de39d674f93a976c617f15f49ca11b2a68bc850c5789
7e5fb1 \
    --control-plane --certificate-key e61aa43f26710748a727e64cdfe0d2b43ae4470a1f81bb1589e8f051d0163b
d1

Please note that the certificate-key gives access to cluster sensitive data, keep it secret!
As a safeguard, uploaded-certs will be deleted in two hours; If necessary, you can use
"kubeadm init phase upload-certs --upload-certs" to reload certs afterward.

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join api-server.k8s.test:6443 --token opomfo.nd0dkto8ye006hda \
    --discovery-token-ca-cert-hash sha256:da3764c85a4727de39d674f93a976c617f15f49ca11b2a68bc850c5789
7e5fb1
```

查看node:
```bash
kubectl get nodes

# 输出
NAME           STATUS     ROLES    AGE   VERSION
k8s-master-1   NotReady   master   5m    v1.18.1
```

# 5. 初始化Worker节点 {#worker-join}

本步骤只需在worker上执行即可。使用上步中输出的信息。
```bash
kubeadm join api-server.k8s.test:6443 --token opomfo.nd0dkto8ye006hda --discovery-token-ca-cert-hash sha256:da3764c85a4727de39d674f93a976c617f15f49ca11b2a68bc850c5789
```

# 6. 部署网络插件 

# 7. 部署dashboard

# 8. Reference {#reference}

{{<file-list regularExpression="^.*\.sh$">}}

https://kubernetes.io/docs/reference/setup-tools/kubeadm/kubeadm-init

https://kuboard.cn/install/install-k8s.html


[docker-install]:/docker/install
