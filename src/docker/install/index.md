---
title: '[Docker] Install'
created_at: 2018-01-28 16:53:01
tag: ["docker","docker-compose","docker-machine","Install"]
toc: true
---

# 1 dokcerd {#dockerd}

## 1.1 Ubuntu {#docker-on-ubuntu} 

{{<highlight-file path="docker-on-ubuntu.sh" lang="bash">}}

## 1.2 CentOS {#docker-on-centos}

{{<highlight-file path="docker-on-centos.sh" lang="bash">}}

## 1.3 Config dockerd {#config-dockerd}

<https://docs.docker.com/engine/reference/commandline/dockerd/>

{{<highlight-file path="config-dockerd.sh" lang="bash">}}

{{<highlight-file path="daemon.json" lang="json">}}

# 2 docker {#docker}

<https://docs.docker.com/engine/install/binaries/>

<https://download.docker.com/mac/static/stable/x86_64/>

# 3 dokcer-compose {#docker-compose}

{{<highlight-file path="docker-compose.sh" lang="bash">}}


# 4 dokcer-machine {#docker-machine}

{{<highlight-file path="docker-machine.sh" lang="bash">}}


# 5 reference {#reference}

https://docs.docker.com/install/linux/docker-ce/ubuntu/

https://docs.docker.com/install/linux/docker-ce/centos/

https://docs.docker.com/compose/install

https://docs.docker.com/machine

https://github.com/docker/compose/releases

https://github.com/docker/machine/releases/

https://github.com/boot2docker/boot2docker/releases

[install.docker-on-ubuntu.sh]:install.docker-on-ubuntu.sh
[install.docker-on-centos.sh]:install.docker-on-centos.sh
[config.dockerd.sh]:config.dockerd.sh

[install.docker-compose.sh]:install.docker-compose.sh
[install.docker-machine.sh]:install.docker-machine.sh
