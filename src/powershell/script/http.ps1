
function Http-Server() {
    Log-Debug "caddy -conf d:\.code\blog\src\tool\caddy\Caddyfile" $Args
    caddy -conf d:\.code\blog\src\tool\caddy\Caddyfile $Args
}