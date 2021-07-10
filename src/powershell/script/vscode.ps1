function VsCode-Open {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )
    Log-Debug "code $Path"
    code $Path
}