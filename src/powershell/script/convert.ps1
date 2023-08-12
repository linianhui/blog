function Byte-Format(
    [Parameter(ValueFromPipeline = $True)]
    [long]$Length
) {
    if ($Length -lt 1KB) {
        return $Length.ToString("#0B")
    }

    if ($Length -lt 1MB) {
        return "$(($Length / 1KB)|Double-Half)KB"
    }

    if ($Length -lt 1GB) {
        return "$(($Length / 1MB)|Double-Half)MB"
    }

    if ($Length -lt 1TB) {
        return "$(($Length / 1GB)|Double-Half)GB"
    }

    if ($Length -lt 1PB) {
        return "$(($Length / 1TB)|Double-Half)TB"
    }

    return "$(($Length / 1PB)|Double-Half)PB"
}

function Double-Half(
    [Parameter(ValueFromPipeline = $True)]
    [Double]$Value
) {
    if ([System.Math]::Floor($Value).CompareTo($Value) -eq 0) {
        return [System.Math]::Floor($Value)
    }

    return [System.Math]::Round($Value, 1)
}

function Mac-Format(
    [Parameter(ValueFromPipeline = $True)]
    [string]$Mac
) {
    $Address = $Null
    if ([System.Net.NetworkInformation.PhysicalAddress]::TryParse($Mac, [ref] $Address) -eq $False) {
        return $Null
    }

    $Hex = $Address.GetAddressBytes() | ForEach-Object { Byte-To-Hex -InputObject $_ }
    return [System.String]::Join(':', $Hex)
}

function Byte-To-Hex() {
    param (
        [Parameter(ValueFromPipeline = $True)]
        [byte]$InputObject
    )
    return $InputObject.ToString('X2');
}