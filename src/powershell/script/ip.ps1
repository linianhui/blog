################################
# powershell ip functions
################################

function set-ip() {
    # show all ethernet interfaces
    netsh interface ipv4 show interfaces

    $defaultIdx=1
    $idx = Read-Host-With-Default -Prompt "select interface idx" -DefaultValue $defaultIdx

    # show selected ethernet interface address
    netsh interface ipv4 show address name=$idx

    # set dhcp
    $dhcp = Read-Host-With-Default -Prompt "set source=[dhcp|static]" -DefaultValue 'static'

    if ('dhcp' -ieq $dhcp) {
        netsh interface ipv4 set address name=$idx source=dhcp

        Write-host "show interface $idx current address" -ForegroundColor Green
        netsh interface ipv4 show address name=$idx
        return
    }

    $defaultIP = '192.168.100.2'
    $ip = Read-Host-With-Default -Prompt 'set ip' -DefaultValue $defaultIP

    $defaultMask = '255.255.255.0'
    $mask = Read-Host-With-Default -Prompt 'set mask' -DefaultValue $defaultMask

    $defaultGateway = $defaultIP.Substring(0, $defaultIP.LastIndexOf('.')) + '.1'
    $gateway = Read-Host-With-Default -Prompt 'set gateway' -DefaultValue $defaultGateway

    netsh interface ipv4 set address name=$idx source=static address=$ip mask=$mask gateway=$gateway
    Write-host "netsh interface ipv4 show address name=$idx" -ForegroundColor Green
    netsh interface ipv4 show address name=$idx
}

function IP-Port-Forward-Add (
    [int] $port,
    [string] $ip
) {
    Log-Debug "netsh interface portproxy add v4tov4 listenport=$port connectaddress=$ip connectport=$port"
    netsh interface portproxy add v4tov4 listenport=$port connectaddress=$ip connectport=$port
}

function IP-Port-Forward-Delete (
    [int] $port
) {
    Log-Debug "netsh interface portproxy delete v4tov4 listenport=$port"
    netsh interface portproxy delete v4tov4 listenport=$port
}


function IP-Port-Forward-Show (
) {
    Log-Debug "netsh interface portproxy show all"
    netsh interface portproxy show all
}