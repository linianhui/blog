
# https://github.com/svenstaro/miniserve
function Http-Server() {
    Log-Debug "miniserve --qrcode --upload-files --dirs-first --hide-theme-selector --enable-webdav --interfaces 192.168.2.2 $Args"
    miniserve --qrcode --upload-files --dirs-first --hide-theme-selector --enable-webdav --interfaces 192.168.2.2 $Args
}

function Http-Server-Temp() {
    Http-Server 'z:/__temp'
}

function Http-Server-Share() {
    Http-Server 'z:/_share'
}