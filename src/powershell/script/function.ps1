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

    # PowerShell 默认视图通常保留两位小数并附加单位
    if ($Bytes -ge 1TB) {
        return "{0:N2} TB" -f ($Bytes / 1TB)
    }
    elseif ($Bytes -ge 1GB) {
        return "{0:N2} GB" -f ($Bytes / 1GB)
    }
    elseif ($Bytes -ge 1MB) {
        return "{0:N2} MB" -f ($Bytes / 1MB)
    }
    else {
        return "{0:N2} KB" -f ($Bytes / 1KB)
    }
}