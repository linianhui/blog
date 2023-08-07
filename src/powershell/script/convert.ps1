function Byte-Format(
    [Parameter(ValueFromPipeline = $True)]
    [long]$Length
) {
    if ($Length -lt 1KB) {
        return $Length.ToString("#0B")
    }

    if ($Length -lt 1MB) {
        return ($Length / 1KB).ToString("#0.0KB")
    }

    if ($Length -lt 1GB) {
        return ($Length / 1MB).ToString("#0.0MB")
    }

    if ($Length -lt 1TB) {
        return ($Length / 1GB).ToString("#0.0GB")
    }

    if ($Length -lt 1PB) {
        return ($Length / 1TB).ToString("#0.0TB")
    }

    return ($Length / 1PB).ToString("#0.0PB")
}

function Mac-Format(
    [Parameter(ValueFromPipeline = $True)]
    [string]$Mac
) {
    return [System.Net.NetworkInformation.PhysicalAddress]::Parse($Mac).ToString()
}