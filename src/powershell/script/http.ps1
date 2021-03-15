
function Http-Server() {
    Log-Debug "caddy -conf d:\_code\blog\src\tool\caddy\Caddyfile" $Args
    caddy -conf d:\_code\blog\src\tool\caddy\Caddyfile $Args
}