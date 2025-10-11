export MY_HOME=/lnh
export MY_HOME_APP=$MY_HOME/_app
export MY_HOME_CACHE=$MY_HOME/_cache
export MY_HOME_CODE=${MY_HOME}/_code
export MY_HOME_CODE_BLOG=${MY_HOME_CODE}/_code/blog
export MY_HOME_CONFIG=$MY_HOME/_config
export MY_HOME_DATA=$MY_HOME/_data

# add gnu
PATH=/usr/local/opt/coreutils/libexec/gnubin:$PATH

# https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
export XDG_CACHE_HOME=$MY_HOME_CACHE
export XDG_CONFIG_HOME=$MY_HOME_CONFIG
export XDG_DATA_HOME=$MY_HOME_DATA

# https://docs.microsoft.com/en-us/dotnet/core/tools/telemetry
# https://docs.microsoft.com/en-us/dotnet/core/tools/dotnet-tool-install
export DOTNET_CLI_TELEMETRY_OPTOUT=false
APP_DOTNET_DIR=$MY_HOME_APP/_dotnet
DOTNET_TOOLS_DIR=$HOME/.dotnet/tools
export PATH=$PATH:$APP_DOTNET_DIR:$DOTNET_TOOLS_DIR

# https://adoptopenjdk.net/releases.html?variant=openjdk11&jvmVariant=hotspot
# APP_JAVA_DIR=$MY_HOME_APP/_java
# APP_JAVA_BIN_DIR=$APP_JAVA_DIR/bin
# export JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF-8
# export JAVA_HOME=$APP_JAVA_DIR
# export PATH=$PATH:$APP_JAVA_BIN_DIR

# https://gradle.org/releases/
APP_GRADLE_DIR=$MY_HOME_APP/_gradle
APP_GRADLE_BIN_DIR=$APP_GRADLE_DIR/bin
CACHE_GRADLE_DIR=$MY_HOME_CACHE/_gradle
export GRADLE_HOME=$APP_GRADLE_DIR
export GRADLE_USER_HOME=$CACHE_GRADLE_DIR
export PATH=$PATH:$APP_GRADLE_BIN_DIR

# https://maven.apache.org/
# http://maven.apache.org/configure.html
APP_MAVEN_DIR=$MY_HOME_APP/_maven
APP_MAVEN_BIN_DIR=$APP_MAVEN_DIR/bin
CACHE_MAVEN_DIR=$MY_HOME_CACHE/_maven
export MAVEN_HOME=$APP_MAVEN_DIR
export M2_HOME=$MAVEN_HOME
export MAVEN_USER_HOME=$MAVEN_HOME
export MAVEN_OPTS='-Xms256m -Xmx1024m'
export PATH=$PATH:$APP_MAVEN_BIN_DIR

# https://projects.spring.io/spring-boot/
# APP_SPRING_BOOT_CLI_DIR=$MY_HOME_APP/_spring-boot-cli
# APP_SPRING_BOOT_CLI_BIN_DIR=$APP_SPRING_BOOT_CLI_DIR/bin
# export PATH=$PATH:$APP_SPRING_BOOT_CLI_BIN_DIR

# https://www.mono-project.com/
# export MONO_HOME=/Library/Frameworks/Mono.framework/Versions/5.0.1
# export MONO_HOME_BIN=$MONO_HOME/bin
# export PATH=$PATH:$MONO_HOME_BIN


# https://docs.docker.com/engine/reference/commandline/cli/
# https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-socket-option
APP_DOCKER_DIR=$MY_HOME_APP/_docker
CONFIG_DOCKER_DIR=$MY_HOME_CONFIG/_docker
export PATH=$PATH:$APP_DOCKER_DIR
export DOCKER_HOST='tcp://127.0.0.1:2375'
export DOCKER_CONFIG=$CONFIG_DOCKER_DIR

# https://docs.docker.com/machine/
# https://docs.docker.com/machine/drivers/virtualbox/
# DATA_DOCKER_DIR=$MY_HOME_DATA/_docker
#export DOCKER_HOME=$APP_DOCKER_DIR
#export MACHINE_STORAGE_PATH=$DATA_DOCKER_DIR
#export VIRTUALBOX_BOOT2DOCKER_URL=$DOCKER_HOME/boot2docker.iso
#export VIRTUALBOX_UI_TYPE=headless
#export VIRTUALBOX_CPU_COUNT=1
#export VIRTUALBOX_MEMORY_SIZE=512
#export VIRTUALBOX_DISK_SIZE=5120

# https://kubernetes.io/docs/tasks/tools/install-kubectl/
APP_KUBECTL_DIR=$MY_HOME_APP/_kubectl
CONFIG_KUBECTL_DIR=$MY_HOME_CONFIG/_kubectl
CONFIG_KUBECTL_CONFIG_FILE=$CONFIG_KUBECTL_DIR/config.yml
export KUBECONFIG=$CONFIG_KUBECTL_CONFIG_FILE
export PATH=$PATH:$APP_KUBECTL_DIR

# https://kubernetes.io/docs/tasks/tools/install-minikube/
# APP_MINIKUBE_DIR=$MY_HOME_APP/_minikube
# DATA_MINIKUBE_DIR=$MY_HOME_DATA/_minikube
# export MINIKUBE_HOME=$DATA_MINIKUBE_DIR
# export MINIKUBE_WANTUPDATENOTIFICATION=false
# export MINIKUBE_WANTREPORTERRORPROMPT=false
# export CHANGE_MINIKUBE_NONE_USER=true
# export PATH=$PATH:$APP_MINIKUBE_DIR

# https://helm.sh/docs
# https://github.com/helm/helm-www
# https://github.com/helm/helm/releases
APP_HELM_DIR=$MY_HOME_APP/_helm
export PATH=$PATH:$APP_HELM_DIR

# https://github.com/mholt/caddy
# https://caddyserver.com/docs/cli
# APP_CADDY_DIR=$MY_HOME_APP/_caddy
# export PATH=$PATH:$APP_CADDY_DIR

# https://github.com/v2ray/v2ray-core
APP_V2RAY_DIR=$MY_HOME_APP/_v2ray
export PATH=$PATH:$APP_V2RAY_DIR


# https://www.rust-lang.org/
# https://github.com/rust-lang/rustup.rs#environment-variables
APP_RUSTUP_DIR=$MY_HOME_APP/_rustup
export RUSTUP_HOME=$APP_RUSTUP_DIR
export RUSTUP_DIST_SERVER=http://mirrors.ustc.edu.cn/rust-static
export RUSTUP_UPDATE_ROOT=http://mirrors.ustc.edu.cn/rust-static/rustup
# https://github.com/rust-lang/cargo/blob/master/src/doc/src/reference/environment-variables.md
APP_CARGO_DIR=$MY_HOME_APP/_cargo
APP_CARGO_BIN_DIR=$APP_CARGO_DIR/bin
export CARGO_HOME=$APP_CARGO_DIR
export PATH=$PATH:$APP_CARGO_BIN_DIR

# https://github.com/gohugoio/hugo
APP_HUGO_DIR=$MY_HOME_APP/_hugo
CACHE_HUGO_DIR=$MY_HOME_CACHE/_hugo
export PATH=$PATH:$APP_HUGO_DIR
export HUGO_CACHEDIR=$CACHE_HUGO_DIR

# https://nodejs.org/en/download/
APP_NODE_DIR=$MY_HOME_APP/_node
APP_NODE_BIN_DIR=$APP_NODE_DIR/bin
export PATH=$PATH:$APP_NODE_BIN_DIR


# https://brew.sh
# https://github.com/Homebrew/brew
# https://developer.aliyun.com/mirror/homebrew
# /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export HOMEBREW_API_DOMAIN=https://mirrors.aliyun.com/homebrew-bottles/api
export HOMEBREW_BREW_GIT_REMOTE=https://mirrors.aliyun.com/homebrew/brew.git
export HOMEBREW_CORE_GIT_REMOTE=https://mirrors.aliyun.com/homebrew/homebrew-core.git
export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.aliyun.com/homebrew/homebrew-bottles

# https://www.db.com/download-center/community
APP_MONGO_DIR=$MY_HOME_APP/_mongo
export PATH=$PATH:$APP_MONGO_DIR

# https://linianhui.github.io/redis/00-install
APP_REDIS_DIR=$MY_HOME_APP/_redis
export PATH=$PATH:$APP_REDIS_DIR

# https://dev.mysql.com/downloads/mysql/
# https://dev.mysql.com/doc/refman/8.0/en/environment-variables.html
APP_MYSQL_DIR=$MY_HOME_APP/_mysql
CACHE_MYSQL_MY_HOME_CONFIG=$XDG_CACHE_HOME/_mysql
export MYSQL_HOME=$APP_MYSQL_DIR
APP_MYSQL_BIN_DIR=$MYSQL_HOME/bin
export MYSQL_HISTFILE=$CACHE_MYSQL_MY_HOME_CONFIG/.history
export PATH=$PATH:$APP_MYSQL_BIN_DIR

# https://github.com/svenstaro/miniserve
APP_MINISERVE_DIR=$MY_HOME_APP/_miniserve
export PATH=$PATH:$APP_MINISERVE_DIR

# http://www.rinetd.com/
# https://github.com/samhocevar/rinetd
APP_RINETD_DIR=$MY_HOME_APP/_rinetd
export PATH=$PATH:$APP_RINETD_DIR

# https://github.com/wagoodman/dive
APP_DIVE_DIR=$MY_HOME_APP/_dive
export PATH=$PATH:$APP_DIVE_DIR

# https://jmeter.apache.org/download_jmeter.cgi
APP_JMETER_DIR=$MY_HOME_APP/_jmeter
APP_JMETER_BIN_DIR=$APP_JMETER_DIR/bin
export PATH=$PATH:$APP_JMETER_BIN_DIR

# iperf2 https://sourceforge.net/projects/iperf2/
# iperf3 https://iperf.fr/
APP_IPERF_DIR=$MY_HOME_APP/_iperf
export PATH=$PATH:$APP_IPERF_DIR

# 杂项工具
APP_OTHER_DIR=$MY_HOME_APP/_other
export PATH=$PATH:$APP_OTHER_DIR
