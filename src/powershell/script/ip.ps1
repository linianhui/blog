################################
# powershell ip functions
################################

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