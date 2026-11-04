[string]$HIWIFI_GET_UUID_PATH = '/cgi-bin/turbo/proxy/router_info';
[string]$HIWIFI_GET_LOCAL_TOKEN_PATH = '/local-ssh/api?method=get';
[string]$HIWIFI_OPEN_SSH_PATH = '/local-ssh/api?method=valid&data=';
[string]$HIWIFI_CLOSE_SSH_PATH = '/local-ssh/api?method=stop';

function HiWifi-Log-Debug {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Label,
        [string] $Value
    )
    if ($PSBoundParameters.ContainsKey('Value')) {
        LOG-DEBUG "$($Label.PadRight(25)): $Value"
    } else {
        LOG-DEBUG $Label
    }
}

function HiWifi-Open-Ssh {
    param (
        [string] $IP = "192.168.199.1"
    )
    $CloudToken = HiWifi-Calc-CloudToken -IP $IP

    $Url = "http://" + $IP + $HIWIFI_OPEN_SSH_PATH + $CloudToken
    HiWifi-Log-Debug -Label "Open SSH URL" -Value $Url

    $Result = ((Invoke-WebRequest -Method GET -Uri $Url).Content)
    HiWifi-Log-Debug -Label "Open SSH URL RESPONSE" -Value $Result

    HiWifi-Log-Debug -Label "ssh -v -o KexAlgorithms=+diffie-hellman-group1-sha1 -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa -o MACs=+hmac-sha1 root@$IP"
    ssh -v -o KexAlgorithms=+diffie-hellman-group1-sha1 -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa -o MACs=+hmac-sha1 root@$IP
}

function HiWifi-Calc-CloudToken() {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $IP
    )
    $UuidUrl = "http://" + $IP + $HIWIFI_GET_UUID_PATH
    HiWifi-Log-Debug -Label "Get UUID URL" -Value $UuidUrl

    $UuidResponse = ((Invoke-WebRequest -Method GET -Uri $UuidUrl).Content)
    HiWifi-Log-Debug -Label "Get UUID URL RESPONSE" -Value $UuidResponse

    $Uuid = ($UuidResponse | ConvertFrom-Json).data.uuid
    HiWifi-Log-Debug -Label "UUID" -Value $Uuid

    $LocalTokenUrl = "http://" + $IP + $HIWIFI_GET_LOCAL_TOKEN_PATH
    HiWifi-Log-Debug -Label "Get Local Token" -Value $LocalTokenUrl

    $LocalTokenResponse = ((Invoke-WebRequest -Method GET -Uri $LocalTokenUrl).Content)
    HiWifi-Log-Debug -Label "Get Local Token RESPONSE" -Value $LocalTokenResponse

    $LocalToken = ($LocalTokenResponse | ConvertFrom-Json).data
    HiWifi-Log-Debug -Label "Local Token" -Value $LocalToken

    $CloudToken = HiWifi-Calc-CloudTokenCore -Uuid $Uuid -LocalToken $LocalToken
    HiWifi-Log-Debug -Label "Cloud Token" -Value $CloudToken
    return $CloudToken;
}

function HiWifi-Calc-CloudTokenCore() {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Uuid,
        [Parameter(Mandatory = $TRUE)]
        [string] $LocalToken
    )
    $Key = HiWifi-Calc-CloudTokenKeyHex -Uuid $Uuid
    $Data = HiWifi-Calc-CloudTokenDataUtf8 -LocalToken $LocalToken
    $HmacSha1 = New-Object System.Security.Cryptography.HMACSHA1
    $HmacSha1.key = [System.Convert]::FromHexString($Key)
    $Hash1 = $HmacSha1.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Data))
    $Result = [System.Convert]::ToBase64String($Hash1)
    return $Result;
}

function HiWifi-Calc-CloudTokenKeyHex() {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Uuid
    )
    $Stream = [System.IO.MemoryStream]::new()
    $Writer = [System.IO.StreamWriter]::new($Stream)
    $Writer.Write($Uuid)
    $Writer.Flush()
    $Stream.Position = 0
    $Hash = (Get-FileHash -InputStream $Stream -Algorithm SHA1)
    return $Hash.Hash;
}

function HiWifi-Calc-CloudTokenDataUtf8() {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $LocalToken
    )
    $UsedLocalTokenBase64 = $LocalToken.Substring(0, 40);
    $UsedLocalTokenBytes = [System.Convert]::FromBase64String($UsedLocalTokenBase64);
    $UsedLocalTokenUtf8 = [System.Text.Encoding]::UTF8.GetString($UsedLocalTokenBytes);
    $Time = $UsedLocalTokenUtf8.Substring(17, 13);
    [Int64]$TimeAdd1 = [System.Convert]::ToInt64($Time) + 1;
    $Result = $UsedLocalTokenUtf8.Replace($Time, $TimeAdd1.ToString());
    return $Result;
}