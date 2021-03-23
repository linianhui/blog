
function Http-Server() {
    Log-Debug "caddy run --config d:\_code\blog\src\tool\caddy\Caddyfile" $Args
    caddy run --config d:\_code\blog\src\tool\caddy\Caddyfile $Args
}