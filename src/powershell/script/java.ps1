function Java-Arthas() {
    # https://arthas.gitee.io/install-detail.html
    Console-Debug "java -jar ${ENV:ARTHAS_BOOT_HOME}arthas-boot.jar --repo-mirror aliyun --use-http $ARGS"
    java -jar ${ENV:ARTHAS_BOOT_HOME}arthas-boot.jar --repo-mirror aliyun --use-http $ARGS
}

function Java-Set-Jdk {
    param (
        [ValidateSet('8', '11', '17', '21')]
        [string] $Version
    )
    $BasePath = 'd:\_lang\_java'
    $JdkPath = $BasePath + $Version

    $CurrentJdkPath = (Get-Item -Path $BasePath).Target
    Console-Info "current jdk path : $CurrentJdkPath"

    if ($JdkPath.Equals($CurrentJdkPath)) {
        Console-Warn "not need change"
    }
    else {
        Console-Warn "Remove-Item $BasePath -Force -Confirm:$False"
        Remove-Item $BasePath -Force -Confirm:$False

        Console-Info "New-Item -ItemType Junction -Path $BasePath -Target $JdkPath | Out-Null"
        Link-Soft -VirtualPath $BasePath -RealPath $JdkPath | Out-Null
    }

    Console-Debug "now jdk path : $((Get-Item -Path $BasePath).Target)"
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

function Java-Maven-Repository-Soft-Link-Create() {
    Link-Soft -VirtualPath 'd:\_lang\_maven\repository' -RealPath "${ENV:HOME_D}\.m2\repository"
}