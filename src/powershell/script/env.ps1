################################
# powershell env functions
################################

[string]$APP_DIR = 'd:\_app\';
[string]$LANG_DIR = 'd:\_lang\';
[string]$CACHE_DIR = 'd:\_cache\';
[string]$CONFIG_DIR = 'd:\_config\';
[string]$DATA_DIR = 'd:\_data\';
[string]$PATH_SPLIT = ';';

function script:Env-TrySetVariable (
    [string]$Variable = $(throw "Variable is null!"),
    [string]$Value = $(throw "Value is null!")
) {
    $Target = [System.EnvironmentVariableTarget]::Machine

    # 输出旧值
    [string]$OldValue = [System.Environment]::GetEnvironmentVariable($Variable, $Target);
    Log-Info "[$Target][$Variable] OLD_VALUE : " $OldValue

    if ($OldValue -eq $Value) {
        Log-Warn "[$Target][$Variable] NEW_VALUE : " $Value
        return
    }

    # 设置环境变量
    [System.Environment]::SetEnvironmentVariable($Variable, $Value, $Target)

    # 输出新值
    [string]$NewValue = [System.Environment]::GetEnvironmentVariable($Variable, $Target);
    Log-Debug "[$Target][$Variable] NEW_VALUE : " $NewValue
    Write-Host
}

function script:Env-TryAppendPathVariable (
    [string]$Value = $(throw "Value is null!")
) {
    $Target = [System.EnvironmentVariableTarget]::Machine
    $Variable = 'Path'
    # 获取旧值
    [string]$OldValue = [System.Environment]::GetEnvironmentVariable($Variable, $Target);
    [array]$OldValueArray = $OldValue -Split $PATH_SPLIT

    # 检测是否已经存在
    if ($OldValueArray -Contains $Value) {
        Log-Warn "[$Target][$Variable] EXISTS_VALUE : $Value"
        return
    }

    Log-Debug "[$Target][$Variable] APPEND_VALUE : $Value"

    # 追加新值
    $OldValueArray += $Value;
    [string]$NewValue = $($OldValueArray | Where-Object { $_ } | Sort-Object -Unique -CaseSensitive:$false | Join-String -Separator $PATH_SPLIT);

    Env-TrySetVariable -Variable $Variable -Value $NewValue
}


function Env-TrySetAll() {
    Get-Command -Name 'Env-Set*EnvironmentVariable' -CommandType Function | ForEach-Object {
        Log-Info "RUN : $($_.Name)"
        Invoke-Expression -Command $_.Name
        Write-Host
        Write-Host
    }
}

function Env-GetAllVariable() {
    Get-ChildItem ENV:
}

function Env-GetPathVariavle() {
    $ENV:PATH -Split $PATH_SPLIT | Sort-Object
}

# https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
function Env-SetXDGEnvironmentVariable() {
    Env-TrySetVariable -Variable 'XDG_CONFIG_HOME' -Value $CONFIG_DIR
    Env-TrySetVariable -Variable 'XDG_CACHE_HOME' -Value $CACHE_DIR
    Env-TrySetVariable -Variable 'XDG_DATA_HOME' -Value $DATA_DIR
}

# https://github.com/MicrosoftArchive/redis/releases
function Env-SetRedisEnvironmentVariable() {
    $APP_REDIS_DIR = $LANG_DIR + '_redis\';

    Env-TryAppendPathVariable -Value $APP_REDIS_DIR
}

# https://www.mongodb.org/dl/win32/x86_64-2008plus-ssl
function Env-SetMongoDBEnvironmentVariable() {
    $APP_MONGO_DIR = $LANG_DIR + '_mongo\';

    Env-TryAppendPathVariable -Value $APP_MONGO_DIR
}

# https://www.putty.org/
function Env-SetPuttyEnvironmentVariable() {
    $APP_PUTTY_DIR = $APP_DIR + '_putty\';

    Env-TryAppendPathVariable -Value $APP_PUTTY_DIR
}

# https://github.com/shadowsocks/shadowsocks-windows
# function Env-SetShadowsocksEnvironmentVariable() {
#     $APP_SHADOWSOCKS_DIR = $APP_DIR + '_shadowsocks\';

#     Env-TryAppendPathVariable -Value $APP_SHADOWSOCKS_DIR
# }

# https://adoptopenjdk.net/upstream.html
# https://developers.redhat.com/products/openjdk/download
# https://arthas.aliyun.com/arthas-boot.jar
function Env-SetJavaEnvironmentVariable() {
    $APP_JAVA_DIR = $LANG_DIR + '_java\';
    $APP_ARTHAS_BOOT_DIR = $LANG_DIR + '_arthas_boot\';
    $APP_JAVA_BIN_DIR = $APP_JAVA_DIR + 'bin\';

    Env-TrySetVariable -Variable 'JAVA_TOOL_OPTIONS' -Value '-Dfile.encoding=UTF-8'

    Env-TrySetVariable -Variable 'JAVA_HOME' -Value $APP_JAVA_DIR
    Env-TrySetVariable -Variable 'ARTHAS_BOOT_HOME' -Value $APP_ARTHAS_BOOT_DIR

    Env-TryAppendPathVariable -Value $APP_JAVA_BIN_DIR
}

# https://golang.org/doc/install
function Env-SetGoEnvironmentVariable() {
    $APP_GO_DIR = $LANG_DIR + '_go\';
    $APP_GO_BIN_DIR = $APP_GO_DIR + 'bin\';

    $CACHE_GO_DIR = $CACHE_DIR + '_go\';

    Env-TrySetVariable -Variable 'GOROOT' -Value $APP_GO_DIR
    Env-TrySetVariable -Variable 'GOCACHE' -Value $CACHE_GO_DIR
    Env-TryAppendPathVariable -Value $APP_GO_BIN_DIR
}

# https://rubyinstaller.org/downloads/
function Env-SetRubyEnvironmentVariable() {
    $APP_RUBY_DIR = $LANG_DIR + '_ruby\';
    $APP_RUBY_BIN_DIR = $APP_RUBY_DIR + 'bin\';

    Env-TrySetVariable -Variable 'RUBY_HOME' -Value $APP_RUBY_DIR
    Env-TryAppendPathVariable -Value $APP_RUBY_BIN_DIR
}

# https://nodejs.org/en/download/
function Env-SetNodeEnvironmentVariable() {
    $APP_NODE_DIR = $LANG_DIR + '_node\';
    $APP_NODE_MODULES_DIR = $APP_NODE_DIR + 'node_modules\';

    $CACHE_NODE_DIR = $CACHE_DIR + '_node\';

    Env-TrySetVariable -Variable 'NODE_PATH' -Value $APP_NODE_MODULES_DIR
    Env-TryAppendPathVariable -Value $APP_NODE_DIR

    npm config set cache $CACHE_NODE_DIR --global
    npm config set registry "https://registry.npm.taobao.org" --global
    npm install -g cnpm --registry=https://registry.npm.taobao.org
}


# https://kotlinlang.org/docs/tutorials/command-line.html
function Env-SetKotlinEnvironmentVariable() {
    $APP_KOTLIN_DIR = $LANG_DIR + '_kotlin\'
    $APP_KOTLIN_BIN_DIR = $APP_KOTLIN_DIR + 'bin\'

    Env-TryAppendPathVariable -Value $APP_KOTLIN_BIN_DIR
}


# https://dotnet.github.io/
# https://docs.microsoft.com/en-us/dotnet/core/tools/telemetry
function Env-SetNetEnvironmentVariable() {
    Env-TrySetVariable -Variable 'DOTNET_CLI_TELEMETRY_OPTOUT' -Value "true"
}

# https://www.python.org/downloads/windows/
# Windows x86-64 embeddable zip file
function Env-SetPythonEnvironmentVariable() {
    $APP_PYTHON_DIR = $LANG_DIR + '_python\';
    $APP_PYTHON_SCRIPTS_DIR = $APP_PYTHON_DIR + 'scripts\';

    Env-TryAppendPathVariable -Value $APP_PYTHON_DIR
    Env-TryAppendPathVariable -Value $APP_PYTHON_SCRIPTS_DIR
}

# https://github.com/icsharpcode/ILSpy/releases
function Env-SetILSpyEnvironmentVariable() {
    $APP_ILSPY_DIR = $LANG_DIR + '_ilspy\';

    Env-TryAppendPathVariable -Value $APP_ILSPY_DIR
}

# https://www.nuget.org/downloads
# https://docs.microsoft.com/en-us/nuget/tools/cli-ref-environment-variables
function Env-SetNugetEnvironmentVariable() {
    $APP_NUGET_DIR = $LANG_DIR + '_nuget\';

    $CACHE_NUGET_DIR = $CACHE_DIR + '_nuget\';

    Env-TrySetVariable -Variable 'NUGET_PACKAGES' -Value $CACHE_NUGET_DIR
    Env-TryAppendPathVariable -Value $APP_NUGET_DIR
}

# https://developer.android.com/studio/releases/platform-tools.html
function Env-SetADBEnvironmentVariable() {
    $APP_ADB_DIR = $APP_DIR + '_adb\';

    Env-TryAppendPathVariable -Value $APP_ADB_DIR
}

# https://www.cpuid.com/softwares/cpu-z.html
function Env-SetCPUZEnvironmentVariable() {
    $APP_CPUZ_DIR = $APP_DIR + '_cpu-z\';

    Env-TryAppendPathVariable -Value $APP_CPUZ_DIR
}

# https://www.techpowerup.com/gpuz/
function Env-SetGPUZEnvironmentVariable() {
    $APP_GPUZ_DIR = $APP_DIR + '_gpu-z\';

    Env-TryAppendPathVariable -Value $APP_GPUZ_DIR
}

# http://www.superpi.net/Download/
function Env-SetPIEnvironmentVariable() {
    $APP_PI_DIR = $APP_DIR + '_pi\';

    Env-TryAppendPathVariable -Value $APP_PI_DIR
}

# https://maven.apache.org/
function Env-SetMavenEnvironmentVariable() {
    $APP_MAVEN_DIR = $LANG_DIR + '_maven\'
    $APP_MAVEN_BIN_DIR = $APP_MAVEN_DIR + 'bin\'
    $CACHE_MAVEN_DIR = $CACHE_DIR + '_maven\'

    # for maven 1
    Env-TrySetVariable -Variable 'MAVEN_HOME' -Value $APP_MAVEN_DIR

    # for maven 2 or 3
    Env-TrySetVariable -Variable 'M2_HOME' -Value $APP_MAVEN_DIR

    # for maven-wrapper https://github.com/takari/maven-wrapper
    Env-TrySetVariable -Variable 'MAVEN_USER_HOME' -Value $APP_MAVEN_DIR

    # http://maven.apache.org/configure.html
    Env-TrySetVariable -Variable 'MAVEN_OPTS' -Value '-Xms256m -Xmx1024m'

    Env-TryAppendPathVariable -Value $APP_MAVEN_BIN_DIR
}

# https://gradle.org/releases/
# https://docs.gradle.org/current/userguide/installation.html
# https://docs.gradle.org/current/userguide/build_environment.html#sec:gradle_environment_variables
function Env-SetGradleEnvironmentVariable() {
    $APP_GRADLE_DIR = $LANG_DIR + '_gradle\';
    $APP_GRADLE_BIN_DIR = $APP_GRADLE_DIR + 'bin\';

    $CACHE_GRADLE_DIR = $CACHE_DIR + '_gradle\';

    Env-TrySetVariable -Variable 'GRADLE_HOME' -Value $APP_GRADLE_DIR
    Env-TrySetVariable -Variable 'GRADLE_USER_HOME' -Value $CACHE_GRADLE_DIR
    Env-TryAppendPathVariable -Value $APP_GRADLE_BIN_DIR
}

# https://projects.spring.io/spring-boot/
function Env-SetSpringBootCliEnvironmentVariable() {
    $APP_SPRING_BOOT_CLI_DIR = $LANG_DIR + '_spring-boot-cli\';
    $APP_SPRING_BOOT_CLI_BIN_DIR = $APP_SPRING_BOOT_CLI_DIR + 'bin\';

    Env-TryAppendPathVariable -Value $APP_SPRING_BOOT_CLI_BIN_DIR
}

# http://httpd.apache.org/download.cgi
function Env-SetHttpdEnvironmentVariable() {
    $APP_HTTPD_DIR = $LANG_DIR + '_httpd\';
    $APP_HTTPD_BIN_DIR = $APP_HTTPD_DIR + 'bin\';

    Env-TryAppendPathVariable -Value $APP_HTTPD_BIN_DIR
}

# https://jmeter.apache.org/download_jmeter.cgi
function Env-SetJmeterEnvironmentVariable() {
    $APP_JMETER_DIR = $LANG_DIR + '_jmeter\';
    $APP_JMETER_BIN_DIR = $APP_JMETER_DIR + 'bin\';

    Env-TryAppendPathVariable -Value $APP_JMETER_BIN_DIR
}

# http://nginx.org/en/download.html
function Env-SetNginxEnvironmentVariable() {
    $APP_NGINX_DIR = $LANG_DIR + '_nginx\';

    Env-TryAppendPathVariable -Value $APP_NGINX_DIR
}

# https://kubernetes.io/docs/tasks/tools/install-kubectl
function Env-SetKubectlEnvironmentVariable() {
    $APP_KUBECTL_DIR = $LANG_DIR + '_kubectl\';

    $CONFIG_KUBECTL_DIR = $CONFIG_DIR + '_kubectl\';
    $CONFIG_KUBECTL_CONFIG_FILE = $CONFIG_KUBECTL_DIR + 'config.yml';

    Env-TrySetVariable -Variable 'KUBECONFIG' -Value $CONFIG_KUBECTL_CONFIG_FILE
    Env-TryAppendPathVariable -Value $APP_KUBECTL_DIR
}

# https://github.com/kubernetes/minikube/releases
# function Env-SetMinikubeEnvironmentVariable() {
#     $APP_MINIKUBE_DIR = $LANG_DIR + '_minikube\';
#     $DATA_MINIKUBE_DIR = 'e:\_minikube\';

#     Env-TrySetVariable -Variable 'MINIKUBE_HOME' -Value $DATA_MINIKUBE_DIR
#     Env-TrySetVariable -Variable 'MINIKUBE_WANTUPDATENOTIFICATION' -Value 'false'
#     Env-TrySetVariable -Variable 'MINIKUBE_WANTREPORTERRORPROMPT' -Value 'false'
#     Env-TrySetVariable -Variable 'CHANGE_MINIKUBE_NONE_USER' -Value 'true'
#     Env-TryAppendPathVariable -Value $APP_MINIKUBE_DIR
# }

# https://docs.docker.com/engine/reference/commandline/cli/#environment-variables
# https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-socket-option
function Env-SetDockerEnvironmentVariable() {
    $APP_DOCKER_DIR = $LANG_DIR + '_docker\';
    $CONFIG_DOCKER_DIR = $CONFIG_DIR + '_docker\';

    Env-TrySetVariable -Variable 'DOCKER_CONFIG' -Value $CONFIG_DOCKER_DIR
    Env-TrySetVariable -Variable 'DOCKER_HOST' -Value 'tcp://127.0.0.1:2375'
    Env-TryAppendPathVariable -Value $APP_DOCKER_DIR
}

# https://docs.docker.com/machine
# https://docs.docker.com/machine/drivers/hyper-v/
# function Env-SetDockerMachineEnvironmentVariable() {
#     $APP_DOCKER_DIR = $LANG_DIR + '_docker\';
#     $BOOT2DOCKER_ISO_DIR = 'file://' + $APP_DOCKER_DIR + 'boot2docker.iso';

#     $DATA_DOCKER_DIR = 'e:\_docker\';

#     Env-TrySetVariable -Variable 'MACHINE_STORAGE_PATH' -Value $DATA_DOCKER_DIR
#     Env-TrySetVariable -Variable 'MACHINE_NATIVE_SSH' -Value 1
#     Env-TrySetVariable -Variable 'HYPERV_BOOT2DOCKER_URL' -Value $BOOT2DOCKER_ISO_DIR
#     Env-TrySetVariable -Variable 'HYPERV_VIRTUAL_SWITCH' -Value 'HVS'
#     Env-TrySetVariable -Variable 'HYPERV_CPU_COUNT' -Value 1
#     Env-TrySetVariable -Variable 'HYPERV_MEMORY' -Value 1024
#     Env-TrySetVariable -Variable 'HYPERV_DISK_SIZE' -Value 10240

#     Env-TryAppendPathVariable -Value $APP_DOCKER_DIR
# }

# https://helm.sh/docs
# https://github.com/helm/helm-www
# https://github.com/helm/helm/releases
function Env-SetHelmEnvironmentVariable() {
    $APP_HLEM_DIR = $LANG_DIR + '_helm\';

    Env-TryAppendPathVariable -Value $APP_HLEM_DIR
}

# https://github.com/mholt/caddy
# https://caddyserver.com/docs/cli
# function Env-SetCaddyEnvironmentVariable() {
#     $APP_CADDY_DIR = $LANG_DIR + '_caddy\';

#     Env-TryAppendPathVariable -Value $APP_CADDY_DIR
# }

# https://coreos.com/os/docs/1911.5.0/overview-of-ct.html
# https://github.com/coreos/container-linux-config-transpiler
# function Env-SetCoreOSEnvironmentVariable() {
#     $APP_COREOS_DIR = $LANG_DIR + '_coreos\';

#     Env-TryAppendPathVariable -Value $APP_COREOS_DIR
# }

# https://docs.microsoft.com/en-us/powershell/scripting/overview?view=powershell-6
function Env-SetPowerShellEnvironmentVariable() {
    Env-TrySetVariable -Variable 'POWERSHELL_TELEMETRY_OPTOUT' -Value 'true'
}

# https://github.com/v2ray/v2ray-core
function Env-SetV2RayEnvironmentVariable() {
    $APP_V2RAY_DIR = $APP_DIR + '_v2ray\';

    Env-TryAppendPathVariable -Value $APP_V2RAY_DIR
}

function Env-SetLocaleEnvironmentVariable() {
    Env-TrySetVariable -Variable 'LC_ALL' -Value 'zh_CN.UTF-8'
    Env-TrySetVariable -Variable 'LANG' -Value 'C.UTF-8'
}

# https://www.alex-is.de/PHP/fusion/downloads.php?cat_id=4&download_id=9
function Env-SetASSSDBenchmarkEnvironmentVariable() {
    $APP_AS_SSD_BENCHMARK_DIR = $APP_DIR + '_as-ssd-benchmark\';

    Env-TryAppendPathVariable -Value $APP_AS_SSD_BENCHMARK_DIR
}

# https://crystalmark.info/en/download/
function Env-SetDiskInfoEnvironmentVariable() {
    $APP_DISK_INFO_DIR = $APP_DIR + '_disk-info\';

    Env-TryAppendPathVariable -Value $APP_DISK_INFO_DIR
}

# https://github.com/pbatard/rufus
function Env-SetRufusEnvironmentVariable() {
    $APP_RUFUS_DIR = $APP_DIR + '_rufus\';

    Env-TryAppendPathVariable -Value $APP_RUFUS_DIR
}

# https://github.com/FFmpeg/FFmpeg
function Env-SetFFmpegEnvironmentVariable() {
    $APP_FFMPEG_DIR = $APP_DIR + '_ffmpeg\bin';

    Env-TryAppendPathVariable -Value $APP_FFMPEG_DIR
}

# https://www.rust-lang.org/
function Env-SetRustEnvironmentVariable() {
    $APP_RUSTUP_DIR = $LANG_DIR + '_rustup\';
    $APP_CARGO_DIR = $LANG_DIR + '_cargo\';
    $APP_CARGO_BIN_DIR = $APP_CARGO_DIR + 'bin\';

    # https://github.com/rust-lang/rustup.rs#environment-variables
    Env-TrySetVariable -Variable 'RUSTUP_HOME' -Value $APP_RUSTUP_DIR
    Env-TrySetVariable -Variable 'RUSTUP_DIST_SERVER' -Value 'http://mirrors.ustc.edu.cn/rust-static'
    Env-TrySetVariable -Variable 'RUSTUP_UPDATE_ROOT' -Value 'http://mirrors.ustc.edu.cn/rust-static/rustup'

    # https://github.com/rust-lang/cargo/blob/master/src/doc/src/reference/environment-variables.md
    Env-TrySetVariable -Variable 'CARGO_HOME' -Value $APP_CARGO_DIR

    Env-TrySetVariable -Variable 'RUST_BACKTRACE' -Value 'full'
    Env-TrySetVariable -Variable 'RUST_TEST_NOCAPTURE' -Value '0'

    Env-TryAppendPathVariable -Value $APP_CARGO_BIN_DIR
}

# https://github.com/gohugoio/hugo
function Env-SetHugoEnvironmentVariable() {
    $APP_HUGO_DIR = $APP_DIR + '_hugo\';
    $CACHE_HUGO_DIR = $CACHE_DIR + '_hugo\';

    Env-TryAppendPathVariable -Value $APP_HUGO_DIR
    Env-TrySetVariable -Variable 'HUGO_CACHEDIR' -Value $CACHE_HUGO_DIR
}

# https://developer.mozilla.org/en-US/docs/Mozilla/Projects/NSS/Key_Log_Format
# https://wiki.wireshark.org/TLS
function Env-SetSslKeyLogFileEnvironmentVariable() {
    $CACHE_SSL_DIR = $CACHE_DIR + '_ssl\';

    $SSLKEYLOGFILE = $CACHE_SSL_DIR + 'ssl.log';

    Env-TrySetVariable -Variable 'SSLKEYLOGFILE' -Value $SSLKEYLOGFILE
}

# https://dev.mysql.com/downloads/mysql/
# https://dev.mysql.com/doc/refman/8.0/en/windows-install-archive.html
# https://dev.mysql.com/doc/refman/8.0/en/environment-variables.html
function Env-SetMySqlEnvironmentVariable() {
    $APP_MYSQL_DIR = $LANG_DIR + '_mysql\';
    $CACHE_MYSQL_DIR = $CACHE_DIR + '_mysql\';
    $DATA_MYSQL_DIR = $DATA_DIR + '_mysql\';
    $APP_MYSQL_BIN_DIR = $APP_MYSQL_DIR + 'bin\';
    $MYSQL_HISTFILE = $CACHE_MYSQL_DIR + '.history';

    Env-TrySetVariable -Variable 'MYSQL_HOME' -Value $APP_MYSQL_DIR
    Env-TrySetVariable -Variable 'MYSQL_DATA' -Value $DATA_MYSQL_DIR
    Env-TrySetVariable -Variable 'MYSQL_HISTFILE' -Value $MYSQL_HISTFILE
    Env-TryAppendPathVariable -Value $APP_MYSQL_BIN_DIR
}

# https://github.com/svenstaro/miniserve
function Env-SetMiniServeEnvironmentVariable() {
    $APP_MINISERVE_DIR = $APP_DIR + '_miniserve\';

    Env-TryAppendPathVariable -Value $APP_MINISERVE_DIR
}

# https://github.com/wagoodman/dive
function Env-SetDiveEnvironmentVariable() {
    $APP_DIVE_DIR = $APP_DIR + '_dive\';

    Env-TryAppendPathVariable -Value $APP_DIVE_DIR
}

# https://www.voidtools.com/zh-cn/
function Env-SetEverythingEnvironmentVariable() {
    $APP_EVERYTHING_DIR = $APP_DIR + '_everything\';

    Env-TryAppendPathVariable -Value $APP_EVERYTHING_DIR
}

# iperf2 https://sourceforge.net/projects/iperf2/
# iperf3 https://iperf.fr/
function Env-SetIperfEnvironmentVariable() {
    $APP_IPERF_DIR = $APP_DIR + '_iperf\';

    Env-TryAppendPathVariable -Value $APP_IPERF_DIR
}

# https://download.sysinternals.com/files/SysinternalsSuite.zip
# https://learn.microsoft.com/zh-cn/sysinternals/downloads/
function Env-SetSysinternalsEnvironmentVariable() {
    $APP_SYSINTERNALS_DIR = $APP_DIR + '_sysinternals\';

    Env-TryAppendPathVariable -Value $APP_SYSINTERNALS_DIR
}

# 杂项工具
function Env-SetOtherEnvironmentVariable() {
    $APP_OTHER_DIR = $APP_DIR + '_other\';

    Env-TryAppendPathVariable -Value $APP_OTHER_DIR
}