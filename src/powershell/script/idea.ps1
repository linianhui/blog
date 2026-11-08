function Idea-Open {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )
    if (Directory-Exists-And-Is-Directory -Path $Path) {
        Console-Debug "idea64 $Path".ToLower()
        idea64 $Path
    }
}