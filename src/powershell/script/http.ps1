
function Http-Server() {
    Log-Debug "caddy -conf d:\.code\.lnh\code\caddy\Caddyfile" $Args
    caddy -conf d:\.code\.lnh\code\caddy\Caddyfile $Args
}