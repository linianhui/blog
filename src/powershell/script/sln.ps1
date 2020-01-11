########################################
# powershell open visual studio sln file
########################################

function script:Sln-GetFiles() {
    $currentPath = Get-Location
    Log-Debug '当前目录：' $currentPath

    $slnFiles = Get-ChildItem -Path $currentPath -File -Filter *.sln

    return $slnFiles
}

function script:Sln-SelectFile($slnFiles) {
    if ($slnFiles.Count -eq 0) {
        throw '没有找到sln文件。'
    }

    if ($slnFiles.Count -eq 1) {
        return $slnFiles[0]
    }
  
    [int]$i = 0
    $slnFiles | ForEach-Object {
        Write-Host $i ': ' $_.Name
        $i++
    }

    [int]$index = Read-Host "找到多个sln文件，请输入编号（默认0）："
    return $slnFiles[$index]
}

function Sln() {
    $slnFiles = Sln-GetFiles
    $slnFile = Sln-SelectFile $slnFiles
    Log-Debug '正在打开：' $slnFile
    Invoke-Item $slnFile
}


