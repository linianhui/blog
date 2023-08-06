function Log-Warn() {
    Write-Host $Args -ForegroundColor Yellow
}

function Log-Debug() {
    Write-Host $Args -ForegroundColor Green
}

function Log-Info() {
    Write-Host $Args -ForegroundColor Gray
}

function Log-NameValue(
    [string] $Name,
    [int] $NamePadding,
    [string] $Value
) {
    Write-Host -NoNewline $Name.PadRight($NamePadding)" : "
    Write-Host $Value -ForegroundColor Green
}