
function Http-Server() {
    Log-Debug "miniserve --color-scheme squirrel --qrcode --upload-files[-u]" $Args
    miniserve --color-scheme squirrel --qrcode $Args
}