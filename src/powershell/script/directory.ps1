$__QUICK_ACCESS_DIRECTORY = New-Object System.Collections.Generic.List[string];

$__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK = {
    param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)
    Directory-Search-Path-List-From-Quick-Access -Search $wordToComplete | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
    }
}

function Directory-Exists-And-Is-Directory {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )

    if (![System.IO.Directory]::Exists($Path)) {
        throw "path $Path is not exist."
    }

    if ([System.IO.File]::Exists($Path)) {
        throw "path $Path is a file."
    }

    return $TRUE;
}

function Directory-Add-To-Quick-Access {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )

    if (Directory-Exists-And-Is-Directory -Path $Path) {
        Get-ChildItem -Path $Path | ForEach-Object {
            if (Test-Path -Path $_.FullName -PathType Container) {
                $__QUICK_ACCESS_DIRECTORY.Add($_.FullName)
            }
        }
    }
}

function Directory-Search-Path-List-From-Quick-Access {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Search = $(throw "Search param is null!")
    )

    $Result1 = Directory-Search-Path-List-From-Quick-Access-1 -Search $Search
    $Result2 = Directory-Search-Path-List-From-Quick-Access-2 -Search $Search

    return List-Append -x $Result1 -y $Result2;
}

function script:Directory-Search-Path-List-From-Quick-Access-1 {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Search = $(throw "Search param is null!")
    )

    $Result = New-Object System.Collections.Generic.List[string];

    $__QUICK_ACCESS_DIRECTORY | ForEach-Object {
        if ($_.Contains($Search)) {
            $Result.Add($_)
        }
    }
    return $Result;
}

function script:Directory-Search-Path-List-From-Quick-Access-2 {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Search = $(throw "Search param is null!")
    )

    $SearchCharArray = $Search.ToCharArray();
    $Result = New-Object System.Collections.Generic.List[string];

    $__QUICK_ACCESS_DIRECTORY | ForEach-Object {
        if (Filter-Directory-Item -Path $_ -Search $Search) {
            $Result.Add($_)
        }
    }

    return $Result;
}

function script:Filter-Directory-Item {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!"),
        [Parameter(Mandatory = $TRUE)]
        [string] $Search = $(throw "Search param is null!")
    )
    $StartIndex = 0;
    for ($i = 0; $i -lt $Search.Length; $i++) {
        $char = $Search[$i];
        $charIndex = $Path.IndexOf($char, $StartIndex);
        if ($charIndex -eq -1) {
            return $FALSE;
        }
        else {
            $StartIndex = $charIndex;
        }
    }
    return $TRUE;
}

function script:List-Append {
    param (
        [System.Collections.Generic.List[string]] $x,
        [System.Collections.Generic.List[string]] $y
    )

    if ($x -eq $NULL) {
        return $y;
    }

    if ($y -eq $NULL) {
        return $x;
    }

    $y | ForEach-Object {
        if (!$x.Contains($_)) {
            $x.Add($_)
        }
    }

    return $x;
}

function Directory-To {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
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