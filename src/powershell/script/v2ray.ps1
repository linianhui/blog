function V2Ray-Upload-InstallScript {
    param (
        [string] $ServerHost,
        [bool] $DryRun = $False
    )
    Log-DEBUG "scp `"d:\_code\blog\src\tool\v2ray\init.sh`" ${ServerHost}:~/v2ray-init.sh"
    if ($DryRun -eq $false) {
        scp "d:\_code\blog\src\tool\v2ray\init.sh" "${ServerHost}:~/v2ray-init.sh"
    }
}

function V2Ray-Download-ClientConfig {
    param (
        [string] $ServerHost,
        [bool] $DryRun = $False
    )
    Log-DEBUG "scp ${ServerHost}:~/v2ray-client-config.json `"d:/_app/_v2ray/${ServerHost}-config.json`""
    if ($DryRun -eq $false) {
        scp "${ServerHost}:~/v2ray-client-config.json" "d:/_app/_v2ray/${ServerHost}-config.json"
    }
}

function V2Ray-Upload-ClientConfig {
    param (
        [string] $ServerHost,
        [string] $ClientHost,
        [bool] $DryRun = $False
    )
    Log-DEBUG "scp `"d:/_app/_v2ray/${ServerHost}-config.json`" ${ClientHost}:/etc/config/v2ray.json"
    if ($DryRun -eq $false) {
        scp "d:/_app/_v2ray/${ServerHost}-config.json" "${ClientHost}:/etc/config/v2ray.json"
    }
}

function V2Ray-Init-Server-And-Client {
    param (
        [string] $ServerHost,
        [string] $ClientHost = "root@192.168.2.123",
        [bool] $DryRun = $False
    )
    $ServerIP = ($ServerHost -split '@')[-1]
    $ClientIP = ($ClientHost -split '@')[-1]
    V2Ray-Upload-InstallScript -ServerHost $ServerHost -DryRun $DryRun

    $InstallCommand = "chmod +x ./v2ray-init.sh;./v2ray-init.sh ${ServerIP} ${ClientIP};exit"
    Log-DEBUG "ssh ${ServerHost} `"${InstallCommand}`""
    if ($DryRun -eq $False) {
        ssh -t ${ServerHost} "${InstallCommand}"
    }

    V2Ray-Download-ClientConfig -ServerHost $ServerHost -DryRun $DryRun

    V2Ray-Upload-ClientConfig -ServerHost $ServerHost -ClientHost $ClientHost -DryRun $DryRun

    Log-DEBUG "ssh $ClientHost `"reboot`""
    if ($DryRun -eq $False) {
        ssh -t $ClientHost "reboot"
    }
}