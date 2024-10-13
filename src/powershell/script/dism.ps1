################################
# FastCopy env functions
################################


function Dism-Backup-Os {
    param (
        [string] $SourceDriver = 'c',
        [string] $TargetDriver = 'd'
    )

    [string]$OsName= Dism-Get-OsName;
    [string]$Date = $(Get-Date -Format 'yyyy-MM-dd');
    [string]$Name = "${OsName}-${Date}".ToLower();
    $COMMAND = "DISM /Capture-Image /CaptureDir:${SourceDriver}:\ /Name:${Name} /ImageFile:${TargetDriver}:\${Name}.wim";
    Log-Debug "$COMMAND";
    $COMMAND | Out-File -FilePath "${TargetDriver}:\dism-${Name}.bat"
}

function Dism-Get-Intl {
    Log-Debug 'DISM /Online /Get-Intl';
    DISM /Online /Get-Intl
}

function Dism-Get-Lang {
    Log-Debug 'Get-Culture | Format-List -Property *';
    Get-Culture | Format-List -Property *
}

function Dism-Get-OsName {
    $ComputerInfo = Get-ComputerInfo;
    [string]$CsName = $ComputerInfo.CsName.Trim().ToLower();
    [string]$OsName = $($($ComputerInfo.OsName.ToLower() -Replace 'microsoft','').Trim() -Replace ' ', '-');
    return "${CsName}-${OsName}";
}