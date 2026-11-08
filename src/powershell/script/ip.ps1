################################
# powershell ip functions
################################

function IP-Set() {
    # show all ethernet interfaces
    netsh interface ipv4 show interfaces

    $defaultIdx = 1
    $idx = Console-ReadLine -Prompt "select interface idx" -DefaultValue $defaultIdx

    # show selected ethernet interface address
    netsh interface ipv4 show address name=$idx

    # set dhcp
    $dhcp = Console-ReadLine -Prompt "set source=[dhcp|static]" -DefaultValue 'static'

    if ('dhcp' -ieq $dhcp) {
        netsh interface ipv4 set address name=$idx source=dhcp

        Write-host "show interface $idx current address" -ForegroundColor Green
        netsh interface ipv4 show address name=$idx
        return
    }

    $defaultIP = '192.168.1.2'
    $ip = Console-ReadLine -Prompt 'set ip' -DefaultValue $defaultIP

    $defaultMask = '255.255.255.0'
    $mask = Console-ReadLine -Prompt 'set mask' -DefaultValue $defaultMask

    $defaultGateway = $defaultIP.Substring(0, $defaultIP.LastIndexOf('.')) + '.1'
    $gateway = Console-ReadLine -Prompt 'set gateway' -DefaultValue $defaultGateway

    netsh interface ipv4 set address name=$idx source=static address=$ip mask=$mask gateway=$gateway
    Write-host "netsh interface ipv4 show address name=$idx" -ForegroundColor Green
    netsh interface ipv4 show address name=$idx
}

function IP-Port-Forward-Add (
    [int] $Port,
    [string] $RemoteIp
) {
    Console-Debug "netsh interface portproxy add v4tov4 listenport=$Port connectaddress=$RemoteIp connectport=$Port"
    netsh interface portproxy add v4tov4 listenport=$Port connectaddress=$RemoteIp connectport=$Port
}

function IP-Port-Forward-Delete (
    [int] $Port
) {
    Console-Debug "netsh interface portproxy delete v4tov4 listenport=$Port"
    netsh interface portproxy delete v4tov4 listenport=$Port
}


function IP-Port-Forward-Show (
) {
    Console-Debug "netsh interface portproxy show all"
    netsh interface portproxy show all
}



function Ip-Forward() {
    [CmdletBinding()]
    param (
        [switch]$Stop = $False,
        [string]$RemoteIp = '192.168.2.201'
    )
    @(80, 2375) | ForEach-Object {
        if ($Stop) {
            Ip-Port-Forward-Delete -Port $_
        }
        else {
            Ip-Port-Forward-Add -Port $_ -RemoteIp $RemoteIp
        }
    }
    Ip-Port-Forward-Show
}