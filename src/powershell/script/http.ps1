
# https://github.com/svenstaro/miniserve
function Http-Server() {
    param (
        [ValidateSet('dufs', 'miniserve','sftpgo')]
        [string] $App = 'miniserve'
    )

    if ($App -eq 'miniserve') {
        Http-Server-Mineserve $Args
    }

    if ($App -eq 'dufs') {
        Http-Server-Dufs $Args
    }

     if ($App -eq 'sftpgo') {
        Http-Server-SFTPGo $Args
    }
}

# https://github.com/svenstaro/miniserve
function Http-Server-Mineserve() {
    Log-Debug "miniserve --qrcode --upload-files --dirs-first --hide-theme-selector --enable-webdav --interfaces 192.168.2.2 $Args"
    miniserve --qrcode --upload-files --dirs-first --hide-theme-selector --enable-webdav --interfaces 192.168.2.2 $Args
}

# https://github.com/sigoden/dufs
function Http-Server-Dufs() {
    Log-Debug "dufs --bind 192.168.2.2 --port 8080 --allow-all --log-file ${env:HOME_APP_LOG}dufs.log $Args"
    dufs --bind 192.168.2.2 --port 8080 --allow-all --log-file ${env:HOME_APP_LOG}dufs.log $Args
}

# https://docs.sftpgo.com/
function Http-Server-SFTPGo() {
    Log-Debug "sftpgo serve --config-dir ${env:HOME_APP}/_sftpgo $Args"
    sftpgo serve --config-dir ${env:HOME_APP}/_sftpgo $Args
}

function Http-Server-Temp() {
    param (
        [ValidateSet('dufs', 'miniserve','sftpgo')]
        [string] $App = 'miniserve'
    )
    Http-Server -App $App 'z:/__temp'
}

function Http-Server-Share() {
    param (
        [ValidateSet('dufs', 'miniserve','sftpgo')]
        [string] $App = 'miniserve'
    )
    Http-Server -App $App 'z:/_share'
}