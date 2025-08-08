function Link-Soft() {
    param (
        [string] $VirtualPath,
        [string] $RealPath
    )
    Log-Debug "New-Item -ItemType SymbolicLink -Path $VirtualPath -Target $RealPath"
    New-Item -ItemType SymbolicLink -Path $VirtualPath -Target $RealPath
}

function Link-Reset-Home {
     param (
        [string] $Path
    )
    Link-Soft -VirtualPath "${ENV:HOME}\${Path}" -RealPath "${ENV:HOME_D}\${Path}"
}

function Link-Reset-Home-All {
    Link-Reset-Home -Path '.android'
    Link-Reset-Home -Path '.dotnet'
    Link-Reset-Home -Path '.m2'
    Link-Reset-Home -Path '.ssh'
    Link-Reset-Home -Path '.nuget'
    Link-Reset-Home -Path '.gitconfig'
    Link-Reset-Home -Path '.bash_history'
}