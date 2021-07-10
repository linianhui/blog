function VsCode-Open {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(Throw "Path param is null!")
    )
    if (Directory-Exists-And-Is-Directory -Path $Path) {
        Log-Debug "code $Path".ToLower()
        code $Path
    }
}