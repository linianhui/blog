function Idea-Open {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )
    Log-Debug "idea64 $Path"
    idea64 $Path
}