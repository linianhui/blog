---
title: '[K8S] kubectl'
created_at: 2020-04-13 22:20:01
tag: ["K8S", "kubectl"]
toc: true
---

kubectl是k8s的command-line工具，用来管理k8s中的各种资源。kubectl是一个go编写的单文件可执行程序，支持Windows、Linux、macOS。kubectl通过HTTPS APIs和k8s的集群的API Service进行通信，使用这些APIs来提供管理功能。


# 1. kubectl的安装和配置 {#install}

因为kubectl是一个单文件可执行程序，安装非常简单，直接下载即可（或者通过yum、apt、brew、choco等包管理器来安装）。

>可以通过<https://storage.googleapis.com/kubernetes-release/release/stable.txt> 来获取最新的版本号。

1. Windows : <https://storage.googleapis.com/kubernetes-release/release/v1.18.1/bin/windows/amd64/kubectl.exe>
2. Linux : <https://storage.googleapis.com/kubernetes-release/release/v1.18.1/bin/linux/amd64/kubectl>
3. macOS : <https://storage.googleapis.com/kubernetes-release/release/v1.18.1/bin/darwin/amd64/kubectl>

下载后将其文件夹加入到系统的`$PATH`即可。
```bash
# 查看客户端版本
kubectl version --client --output yaml

# 输出
clientVersion:
  buildDate: "2020-04-08T17:38:50Z"
  compiler: gc
  gitCommit: 7879fc12a63337efff607952a323df90cdc7a335
  gitTreeState: clean
  gitVersion: v1.18.1
  goVersion: go1.13.9
  major: "1"
  minor: "18"
  platform: windows/amd64
```

kubectl依赖一个yml格式的文件来配置需要管理的k8s集群的相关信息。配置文件默认路径为`$HOME/.kube/config`，默认路径可以通过`$KUBECONFIG`环境变量来更改。也可以在执行命令时通过`--kubeconfig='config-path'`来指定。

# 2. Reference {#reference}

1. <https://kubernetes.io/docs/tasks/tools/install-kubectl>

{{<highlight-file path="terminated-pod.txt" lang="txt">}}