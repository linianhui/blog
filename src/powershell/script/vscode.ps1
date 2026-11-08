function VsCode-Open {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )
    if (Directory-Exists-And-Is-Directory -Path $Path) {
        Console-Debug "code $Path".ToLower()
        code $Path
    }
}