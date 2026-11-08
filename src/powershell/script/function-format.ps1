function Format-Byte(
    [Parameter(ValueFromPipeline = $True)]
    [long]$Value,
    [string]$Split = ''
) {
    if ($Value -lt 1KB) {
        return $Value.ToString("#0${Split}B")
    }

    if ($Value -lt 1MB) {
        return "$(($Value / 1KB) | Format-Double -Digits 0)${Split}KB"
    }

    if ($Value -lt 1GB) {
        return "$(($Value / 1MB) | Format-Double -Digits 0)${Split}MB"
    }

    if ($Value -lt 1TB) {
        return "$(($Value / 1GB) | Format-Double -Digits 0)${Split}GB"
    }

    if ($Value -lt 1PB) {
        return "$(($Value / 1TB) | Format-Double -Digits 1)${Split}TB"
    }

    return "$(($Value / 1PB) | Format-Double -Digits 1)${Split}PB"
}

function Format-Double(
    [Parameter(ValueFromPipeline = $True)]
    [Double]$Value,
    [Parameter(ValueFromPipeline = $True)]
    [int]$Digits = 1
) {
    if ([System.Math]::Floor($Value).CompareTo($Value) -eq 0) {
        return [System.Math]::Floor($Value)
    }

    return [System.Math]::Round($Value, $Digits)
}

function Format-Mac(
    [Parameter(ValueFromPipeline = $True)]
    [string]$Mac
) {
    $Address = $Null
    if ([System.Net.NetworkInformation.PhysicalAddress]::TryParse($Mac, [ref] $Address) -eq $False) {
        return $Null
    }

    $Hex = $Address.GetAddressBytes() | ForEach-Object { Format-Byte-To-Hex -InputObject $_ }
    return [System.String]::Join(':', $Hex)
}

function Format-Byte-To-Hex() {
    param (
        [Parameter(ValueFromPipeline = $True)]
        [byte]$InputObject
    )
    return $InputObject.ToString('X2');
}