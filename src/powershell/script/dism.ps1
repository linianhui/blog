################################
# FastCopy env functions
################################


function DISM-BACKUP-OS {
    param (
        [string] $Driver = 'C',
        [string] $TargetPath = 'Z:\'
    )

    $ComputerInfo = Get-ComputerInfo;
    [string]$CsCaption = $($ComputerInfo.CsCaption -Replace ' ', '-').ToLower();
    [string]$WindowsProductName = $($ComputerInfo.WindowsProductName -Replace ' ', '-').ToLower();
    [string]$Date = $(Get-Date -Format 'yyyy-MM-dd');
    [string]$DateTime = $(Get-Date -Format 'yyyy-MM-dd-HH-mm');
    [string]$Name = "${CsCaption}-${WindowsProductName}-${DateTime}".ToLower();
    [string]$ImageName = "${CsCaption}-${WindowsProductName}-${Date}".ToLower();

    [string]$Caption = $((Get-CimInstance -ClassName Win32_OperatingSystem).Caption -Replace ' ', '-').ToLower();

    $COMMAND="DISM /Capture-Image /CaptureDir:${Driver}:\ /Name:${Name}  /ImageFile:${TargetPath}${ImageName}.wim";
    Log-Debug "$COMMAND";
    Invoke-Expression $COMMAND
}