################################
# FastCopy env functions
################################


function Dism-Backup-Os {
    param (
        [string] $SourcePath = 'c:\',
        [string] $TargetPath = 'f:\_backup\'
    )

    [string]$OsName = Dism-Get-OsName;
    [string]$Date = $(Get-Date -Format 'yyyy-MM-dd');
    [string]$Name = "${OsName}-${Date}".ToLower();
    [string]$ImageFile = "${TargetPath}${OsName}.wim";

    $CaptureImageCommand = "DISM /Capture-Image /CaptureDir:${SourcePath} /Name:${Name} /ImageFile:${ImageFile}";
    $GetImageCommand = "DISM /Get-ImageInfo /ImageFile:$ImageFile";
    $BatFilePath = "d:\dism-${OsName}.bat";

    $CaptureImageCommand | Out-File -FilePath $BatFilePath
    $GetImageCommand | Out-File -Append -FilePath $BatFilePath
    Get-Content -Path $BatFilePath
}

function Dism-Backup-Os-Append {
    param (
        [string] $SourcePath = 'c:\',
        [string] $ImageFile
    )
    $GetImageCommand = "DISM /Get-ImageInfo /ImageFile:$ImageFile";

    [string]$OsName = Dism-Get-OsName;
    [string]$Date = $(Get-Date -Format 'yyyy-MM-dd');
    [string]$Name = "${OsName}-${Date}".ToLower();

    $AppendCommand = "DISM /Append-Image /CaptureDir:${SourcePath} /Name:${Name} /ImageFile:$ImageFile";
    $BatFilePath = "d:\dism-${OsName}-append.bat";

    $GetImageCommand | Out-File -FilePath $BatFilePath
    $AppendCommand | Out-File -Append -FilePath $BatFilePath
    $GetImageCommand | Out-File -Append -FilePath $BatFilePath
    Get-Content -Path $BatFilePath
}

function Dism-Get-Image-Info {
    param (
        [string] $ImageFile
    )
    DISM /Get-ImageInfo /ImageFile:$ImageFile
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
    [string]$OsName = $($($ComputerInfo.OsName.ToLower() -Replace 'microsoft', '').Trim() -Replace ' ', '-');
    return "${CsName}-${OsName}";
}

# https://www.cnblogs.com/lindexi/p/17679590.html
# https://learn.microsoft.com/zh-cn/windows-hardware/manufacture/desktop/clean-up-the-winsxs-folder?view=windows-11
# https://learn.microsoft.com/zh-cn/windows-hardware/manufacture/desktop/dism-operating-system-package-servicing-command-line-options?view=windows-11#cleanup-image
function Dism-WinSxs-Stats {
    Log-Debug 'DISM /Online /Cleanup-Image /AnalyzeComponentStore'
    DISM /Online /Cleanup-Image /AnalyzeComponentStore
}

function Dism-WinSxs-Clean {
    Log-Debug 'DISM /online /Cleanup-Image /StartComponentCleanup'
    DISM /online /Cleanup-Image /StartComponentCleanup
}

function Dism-WinSxs-Clean-All {
    Log-Debug 'DISM /online /Cleanup-Image /StartComponentCleanup /ResetBase'
    DISM /online /Cleanup-Image /StartComponentCleanup /ResetBase
}

function Dism-WinSxs-Repair {
    Log-Debug '/Cleanup-Image /RestoreHealth /Source:X:\Sources\install.wim /LimitAccess'
    DISM /Online /Cleanup-Image /RestoreHealth
    # sfc /scannow
    # DISM /Online /Cleanup-Image /RestoreHealth /Source:X:\Sources\install.wim /LimitAccess
}