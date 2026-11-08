
function Gui-Open-Explorer () {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )
    if (Directory-Exists-And-Is-Directory -Path $Path) {
        Console-Debug "explorer $Path".ToLower()
        explorer $Path
    }
}
