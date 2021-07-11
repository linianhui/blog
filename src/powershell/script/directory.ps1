$__QUICK_ACCESS_DIRECTORY = [System.Collections.Generic.List[PSObject]]::new();

$__QUICK_ACCESS_DIRECTORY_SCRIPT_BLOCK = {
    param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)
    Directory-Search-Path-List-From-Quick-Access -Search $wordToComplete | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_.FullPath, $_.FullPath, 'ParameterValue', $_.FullPath)
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

function script:Directory-Get-Abbr {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Name = $(throw "Name param is null!")
    )
    $Abbr = "";
    $Words = $Name.Split(" _.-".ToCharArray(), [System.StringSplitOptions]::RemoveEmptyEntries);
    $Words | ForEach-Object {
        $Abbr += $_[0];
    }
    return $Abbr;
}

function script:Directory-ConvertToDirObject {
    param ($Raw)
    $FullPath = $Raw.FullName;
    $Name = (Split-Path -Path $FullPath -Leaf);
    $NameAbbr = (Directory-Get-Abbr -Name $Name);

    $Parent = (Split-Path -Path $FullPath -Parent);
    $ParentName = (Split-Path -Path $Parent -Leaf);
    $ParentNameAbbr = (Directory-Get-Abbr -Name $ParentName);
    $Dir = New-Object PSObject -Property @{
        #Raw      = $Raw;
        Abbr     = "$ParentNameAbbr$NameAbbr";
        NameAbbr = $NameAbbr;
        FullPath = $FullPath;
    }
    return $Dir
}

function Directory-Add-To-Quick-Access {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Path = $(throw "Path param is null!")
    )

    if (Directory-Exists-And-Is-Directory -Path $Path) {
        Get-ChildItem -Path $Path | ForEach-Object {
            if (Test-Path -Path $_.FullName -PathType Container) {
                $__QUICK_ACCESS_DIRECTORY.Add((Directory-ConvertToDirObject -Raw $_))
            }
        }
    }
}

function Directory-List-Quick-Access {
    $__QUICK_ACCESS_DIRECTORY | Format-Table -AutoSize
}

function Directory-Search-Path-List-From-Quick-Access {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Search = $(throw "Search param is null!")
    )

    $ResultWithScopeIndex = [PSObject[][]]::new(10);
    $__QUICK_ACCESS_DIRECTORY | ForEach-Object {
        $Score = Directory-Search-Score -Dir $_ -Search $Search
        if ($Score -gt -1) {
            $ResultWithScopeIndex[$Score] += $_
        }
    }
    [array]::Reverse($ResultWithScopeIndex);

    $Result = [System.Collections.Generic.List[PSObject]]::new();
    $ResultWithScopeIndex | ForEach-Object {
        if ($_ -ne $NULL) {
            $Result.AddRange($_)
        }
    }

    return $Result;
}

function script:Directory-Search-Score {
    param ($Dir, [string] $Search )
    if ($Dir.FullPath.Contains($Search, [StringComparison]::OrdinalIgnoreCase)) {
        return 9;
    }
    if ($Dir.Abbr.Contains($Search, [StringComparison]::OrdinalIgnoreCase)) {
        return 8;
    }
    if ($Dir.NameAbbr.Contains($Search, [StringComparison]::OrdinalIgnoreCase)) {
        return 7;
    }
    if (Filter-Directory-Item -Dir $Dir -Search $Search) {
        return 1;
    }

    return -1;
}


function script:Filter-Directory-Item {
    param ($Dir, [string] $Search )
    $StartIndex = 0;
    for ($i = 0; $i -lt $Search.Length; $i++) {
        $char = $Search[$i];
        $charIndex = $Dir.FullPath.IndexOf($char, $StartIndex);
        if ($charIndex -eq -1) {
            return $FALSE;
        }
        else {
            $StartIndex = $charIndex;
        }
    }
    return $TRUE;
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