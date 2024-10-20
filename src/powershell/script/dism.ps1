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