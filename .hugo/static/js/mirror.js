function lnh_mirror(mirror_origin) {
    var origin = window.location.origin;
    if (mirror_origin == origin) {
        return;
    }
    window.location.href = window.location.href.replace(origin, mirror_origin)
}
