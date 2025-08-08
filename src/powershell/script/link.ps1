function Link-Soft() {
    param (
        [string] $VirtualPath,
        [string] $RealPath
    )
    Log-Debug "New-Item -ItemType SymbolicLink -Path $VirtualPath -Target $RealPath"
    New-Item -ItemType SymbolicLink -Path $VirtualPath -Target $RealPath
}

function Link-Reset-Home-Sub-Dir {
     param (
        [string] $Dir
    )
    Link-Soft -VirtualPath "${ENV:HOME}\${Dir}" -RealPath "${ENV:HOME_D}\${Dir}"
}

function Link-Reset-Home-Sub-Dir-All {
    Link-Reset-Home-Sub-Dir -Dir '.m2'
    Link-Reset-Home-Sub-Dir -Dir '.ssh'
    Link-Reset-Home-Sub-Dir -Dir '.nuget'
}