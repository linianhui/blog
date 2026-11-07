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

function Format-Bytes {
    param([uint64]$Bytes)

    if ($Bytes -ge 1TB) {
        return "{0:N1} TB" -f ($Bytes / 1TB)
    }
    elseif ($Bytes -ge 1GB) {
        return "{0:N0} GB" -f ($Bytes / 1GB)
    }
    elseif ($Bytes -ge 1MB) {
        return "{0:N0} MB" -f ($Bytes / 1MB)
    }
    else {
        return "{0:N0} KB" -f ($Bytes / 1KB)
    }
}