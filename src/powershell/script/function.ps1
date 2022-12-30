function Read-Host-With-Default {
    param (
        [String]$Prompt,
        [String]$DefaultValue
    )
    $Input = Read-Host -Prompt "$Prompt,default $DefaultValue"
    $Input = (-not($input))?"$DefaultValue":"$Input"
    Write-host "$Prompt $Input" -ForegroundColor Green
    return $Input
}