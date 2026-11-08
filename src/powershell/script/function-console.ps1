function Console-ReadLine {
    param (
        [String]$Prompt,
        [String]$DefaultValue
    )
    $Input = Read-Host -Prompt "$Prompt,default $DefaultValue"
    $Input = (-not($input))?"$DefaultValue":"$Input"
    Write-host "$Prompt $Input" -ForegroundColor Green
    return $Input
}

function Console-Info() {
    Write-Host $Args -ForegroundColor Gray
}

function Console-Warn() {
    Write-Host $Args -ForegroundColor Yellow
}

function Console-Debug() {
    Write-Host $Args -ForegroundColor Green
}

function Console-Debug-Name-Value(
    [string] $Name,
    [int] $NamePadding,
    [string] $Value
) {
    Write-Host -NoNewline $Name.PadRight($NamePadding)" : "
    Write-Host $Value -ForegroundColor Green
}