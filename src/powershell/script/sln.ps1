########################################
# powershell open visual studio sln file
########################################

function script:Sln-GetFiles() {
    $currentPath = Get-Location
    Log-Debug 'current path : ' $currentPath

    $slnFiles = Get-ChildItem -Path $currentPath -File -Filter *.sln

    return $slnFiles
}

function script:Sln-SelectFile($slnFiles) {
    if ($slnFiles.Count -eq 0) {
        throw 'sln file not found.'
    }

    if ($slnFiles.Count -eq 1) {
        return $slnFiles[0]
    }

    [int]$i = 0
    $slnFiles | ForEach-Object {
        Write-Host $i ': ' $_.Name
        $i++
    }

    [int]$index = Read-Host 'find more sln file, please input index (default 0) :'
    return $slnFiles[$index]
}

function Sln() {
    $slnFiles = Sln-GetFiles
    $slnFile = Sln-SelectFile $slnFiles
    Log-Debug 'opening...   : ' $slnFile
    Invoke-Item $slnFile
}
