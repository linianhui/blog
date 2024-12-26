function Java-Arthas() {
    # https://arthas.gitee.io/install-detail.html
    Log-Debug "java -jar $ENV:JAVA_HOME\arthas-boot.jar --repo-mirror aliyun --use-http $ARGS"
    java -jar $ENV:JAVA_HOME\arthas-boot.jar --repo-mirror aliyun --use-http $ARGS
}

function Java-Set-Jdk {
    param (
        [ValidateSet('8', '11', '17', '21')]
        [string] $Version
    )
    $BasePath = 'd:\_lang\_java'
    $JdkPath = $BasePath + $Version

    $CurrentJdkPath = (Get-Item -Path $BasePath).Target
    Log-Info "current jdk path : $CurrentJdkPath"

    if ($JdkPath.Equals($CurrentJdkPath)) {
        Log-Warn "not need change"
    }
    else {
        Log-Warn "Remove-Item $BasePath -Force -Confirm:$False"
        Remove-Item $BasePath -Force -Confirm:$False

        Log-Info "New-Item -ItemType Junction -Path $BasePath -Target $JdkPath | Out-Null"
        New-Item -ItemType Junction -Path $BasePath -Target $JdkPath | Out-Null
    }

    Log-Debug "now jdk path : $((Get-Item -Path $BasePath).Target)"
    java -version
}

function Java8 {
    Java-Set-Jdk -Version 8
}

function Java11 {
    Java-Set-Jdk -Version 11
}

function Java17 {
    Java-Set-Jdk -Version 17
}

function Java21 {
    Java-Set-Jdk -Version 21
}