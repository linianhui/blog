$__QUICK_ACCESS_DIRECTORY = New-Object System.Collections.Generic.List[System.IO.FileSystemInfo];

$__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK = {
    param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)
    Directory-Get-Path-List-From-Quick-Access -Search $wordToComplete | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_.FullName, $_, 'ParameterValue', $_)
    }
}


function Directory-Exists-And-Is-Directory {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(Throw "Path param is null!")
    )

    if (![System.IO.Directory]::Exists($Path)) {
        Throw "path $Path is not exist."
    }

    if ([System.IO.File]::Exists($Path)) {
        Throw "path $Path is a file."
    }

    return $TRUE;
}

function Directory-Add-To-Quick-Access {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(Throw "Path param is null!")
    )

    if (Directory-Exists-And-Is-Directory -Path $Path) {
        Get-ChildItem -Path $Path | ForEach-Object {
            if (Test-Path -Path $_.FullName -PathType Container) {
                $__QUICK_ACCESS_DIRECTORY.Add($_)
            }
        }
    }
}

function Directory-Get-Path-List-From-Quick-Access {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Search = $(Throw "Search param is null!")
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
        [char[]] $SearchCharArray = $(Throw "SearchCharArray param is null!"),
        [System.IO.FileSystemInfo] $File = $(Throw "File param is null!")
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
        [string] $Path = $(Throw "Path param is null!")
    )
    if (Directory-Exists-And-Is-Directory -Path $Path) {
        Log-Debug "cd $Path".ToLower()
        Set-Location $Path
    }
}

Directory-Add-To-Quick-Access -Path d:/_code/
Directory-Add-To-Quick-Access -Path d:/_github/
Directory-Add-To-Quick-Access -Path d:/
Directory-Add-To-Quick-Access -Path d:/_app/
Directory-Add-To-Quick-Access -Path d:/_cache/