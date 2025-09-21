
# https://github.com/svenstaro/miniserve
function Http-Server() {
    param (
        [ValidateSet('dufs', 'miniserve', 'sftpgo')]
        [string] $App = 'miniserve',
        [string] $Path = $((Get-Location).Path)
    )

    if ($App -eq 'miniserve') {
        Http-Server-Mineserve -Path $Path
    }

    if ($App -eq 'dufs') {
        Http-Server-Dufs -Path $Path
    }

    if ($App -eq 'sftpgo') {
        Http-Server-SFTPGo -Path $Path
    }
}

# https://github.com/svenstaro/miniserve
function Http-Server-Mineserve() {
    param (
        [string] $Path = $((Get-Location).Path)
    )
    Log-Debug "miniserve --qrcode --upload-files --dirs-first --hide-theme-selector --enable-webdav --interfaces 192.168.2.2 $Path $Args"
    miniserve --qrcode --upload-files --dirs-first --hide-theme-selector --enable-webdav --interfaces 192.168.2.2 $Path
}

# https://github.com/sigoden/dufs
function Http-Server-Dufs() {
    param (
        [string] $Path = $((Get-Location).Path)
    )
    Log-Debug "dufs --bind 192.168.2.2 --port 8080 --allow-all --log-file ${env:HOME_APP_LOG}dufs.log $Path $Args"
    dufs --bind 192.168.2.2 --port 8080 --allow-all --log-file ${env:HOME_APP_LOG}dufs.log $Path
}

# https://docs.sftpgo.com/
function Http-Server-SFTPGo() {
    param (
        [string] $Path = $((Get-Location).Path)
    )
    Log-Debug "sftpgo serve --config-dir ${env:HOME_APP}/_sftpgo $Path $Args"
    sftpgo serve --config-dir ${env:HOME_APP}/_sftpgo $Path
}

function Http-Server-Temp() {
    param (
        [ValidateSet('dufs', 'miniserve', 'sftpgo')]
        [string] $App = 'miniserve'
    )
    Http-Server -App $App -Path 'z:/__temp'
}

function Http-Server-Share() {
    param (
        [ValidateSet('dufs', 'miniserve', 'sftpgo')]
        [string] $App = 'miniserve'
    )
    Http-Server -App $App -Path 'z:/_share'
}