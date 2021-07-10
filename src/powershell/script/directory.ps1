$__QUICK_ACCESS_DIRECTORY = New-Object System.Collections.Generic.List[System.IO.FileSystemInfo];

$__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK = {
    param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)
    Directory-Get-Path-List-From-Quick-Access -Search $wordToComplete | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_.FullName, $_, 'ParameterValue', $_)
    }
}

function Directory-Add-To-Quick-Access {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )

    if (![System.IO.Directory]::Exists($Path)) {
        if ([System.IO.File]::Exists($Path)) {
            Write-Error -Message "$Path is a file."
            return;
        }
        Write-Error -Message "$Path is not exist."
        return;
    }

    Get-ChildItem -Path $Path | ForEach-Object {
        if (Test-Path -Path $_.FullName -PathType Container) {
            $__QUICK_ACCESS_DIRECTORY.Add($_)
        }
    }
}

function Directory-Get-Path-List-From-Quick-Access {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Search = $(throw "Search param is null!")
    )

    $SearchCharArray = $Search.ToCharArray();
    $Result = New-Object System.Collections.Generic.List[System.IO.FileSystemInfo];

    $__QUICK_ACCESS_DIRECTORY | ForEach-Object {
        if (Filter-Directory-Item -SearchCharArray $SearchCharArray -File $_) {
            $Result.Add($_)
        }
    }

    return $Result;
}

function script:Filter-Directory-Item {
    param (
        [Parameter(Mandatory = $TRUE)]
        [char[]] $SearchCharArray = $(throw "SearchCharArray param is null!"),
        [System.IO.FileSystemInfo] $File = $(throw "File param is null!")
    )
    $FullPath = $File.FullName;
    $StartIndex = 0;
    for ($i = 0; $i -lt $SearchCharArray.Count; $i++) {
        $char = $SearchCharArray[$i];
        if ($FullPath.IndexOf($char, $StartIndex) -eq -1) {
            return $FALSE;
        }
        else {
            $StartIndex = $i;
        }
    }
    return $TRUE;
}

function Directory-To {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )
    Log-Debug "cd $Path"
    Set-Location $Path
}