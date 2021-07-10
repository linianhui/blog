function Idea-Open {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(Throw "Path param is null!")
    )
    if (Directory-Exists-And-Is-Directory -Path $Path) {
        Log-Debug "idea64 $Path".ToLower()
        idea64 $Path
    }
}