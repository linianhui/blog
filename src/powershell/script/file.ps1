################################
# powershell file functions
################################

function File-GetBigFiles ([int]$top = 20) {
    $begin = Get-Date
    Log-Debug "begin..." $begin

    Get-ChildItem -Path $(Get-Location) -File -Recurse |
    Sort-Object Length -Descending |
    Select-Object -First $top |
    Format-Table -Property @{Label = "Size"; Expression = { ($_.Length / 1MB).ToString(('0.000')) + 'MB' } }, FullName -Wrap

    $end = Get-Date
    Log-Debug "end..." $end
    Log-Debug "elapsed times" ($end - $begin)
}


function File-GetAll {
    param (
        [string] $Path = $(Get-Location)
    )

    Get-ChildItem -Path $Path -Directory | ForEach-Object {
        File-GetAll -Path $_
    }

    Get-ChildItem -Path $Path -File | ForEach-Object {
        $_.FullName
    }
}

function File-Diff {
    param (
        [string] $PartFile,
        [string] $FullFile
    )

    $PartContent = $(Get-Content $PartFile)
    Get-Content -Path $FullFile | ForEach-Object {
        if ($PartContent.Contains($_) -eq $FALSE) {
            $_
        }
    }
}

