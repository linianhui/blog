function byte-format(
    [Parameter(ValueFromPipeline = $True)]
    [long]$length
) {
    if ($length -lt 1KB) {
        $length.ToString("#0B")
    }
    elseif ($length -lt 1MB) {
        ($length / 1KB).ToString("#0.0KB")
    }
    elseif ($length -lt 1GB) {
        ($length / 1MB).ToString("#0.0MB")
    }
    elseif ($length -lt 1TB) {
         ($length / 1GB).ToString("#0.0GB")
    }
    elseif ($length -lt 1PB) {
        ($length / 1TB).ToString("#0.0TB")
    }
    else {
         ($length / 1PB).ToString("#0.0PB")
    }
}