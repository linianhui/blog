[string]$HIWIFI_GET_UUID_PATH = '/cgi-bin/turbo/proxy/router_info';
[string]$HIWIFI_GET_LOCAL_TOKEN_PATH = '/local-ssh/api?method=get';
[string]$HIWIFI_OPEN_SSH_PATH = '/local-ssh/api?method=valid&data=';
[string]$HIWIFI_CLOSE_SSH_PATH = '/local-ssh/api?method=stop';

function HiWifi-Open-Ssh {
    param (
        [string] $IP = "192.168.199.1"
    )
    $CloudToken = HiWifi-Calc-Cloud-Token -IP $IP

    $Url = "http://" + $IP + $HIWIFI_OPEN_SSH_PATH + $CloudToken
    Console-Debug-Name-Value -NamePadding 25 -Name "Open SSH URL" -Value $Url

    $Result = ((Invoke-WebRequest -Method GET -Uri $Url).Content)
    Console-Debug-Name-Value -NamePadding 25 -Name "Open SSH URL RESPONSE" -Value $Result

    Console-Debug-Name-Value -NamePadding 25 -Name "ssh -v -o KexAlgorithms=+diffie-hellman-group1-sha1 -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa -o MACs=+hmac-sha1 root@$IP"
    ssh -v -o KexAlgorithms=+diffie-hellman-group1-sha1 -o HostKeyAlgorithms=+ssh-rsa -o PubkeyAcceptedAlgorithms=+ssh-rsa -o MACs=+hmac-sha1 root@$IP
}

function HiWifi-Calc-Cloud-Token() {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $IP
    )
    $UuidUrl = "http://" + $IP + $HIWIFI_GET_UUID_PATH
    Console-Debug-Name-Value -NamePadding 25 -Name "Get UUID URL" -Value $UuidUrl

    $UuidResponse = ((Invoke-WebRequest -Method GET -Uri $UuidUrl).Content)
    Console-Debug-Name-Value -NamePadding 25 -Name "Get UUID URL RESPONSE" -Value $UuidResponse

    $Uuid = ($UuidResponse | ConvertFrom-Json).data.uuid
    Console-Debug-Name-Value -NamePadding 25 -Name "UUID" -Value $Uuid

    $LocalTokenUrl = "http://" + $IP + $HIWIFI_GET_LOCAL_TOKEN_PATH
    Console-Debug-Name-Value -NamePadding 25 -Name "Get Local Token" -Value $LocalTokenUrl

    $LocalTokenResponse = ((Invoke-WebRequest -Method GET -Uri $LocalTokenUrl).Content)
    Console-Debug-Name-Value -NamePadding 25 -Name "Get Local Token RESPONSE" -Value $LocalTokenResponse

    $LocalToken = ($LocalTokenResponse | ConvertFrom-Json).data
    Console-Debug-Name-Value -NamePadding 25 -Name "Local Token" -Value $LocalToken

    $CloudToken = HiWifi-Calc-Cloud-Token-Core -Uuid $Uuid -LocalToken $LocalToken
    Console-Debug-Name-Value -NamePadding 25 -Name "Cloud Token" -Value $CloudToken
    return $CloudToken;
}

function HiWifi-Calc-Cloud-Token-Core() {
    param (
        [Parameter(Mandatory = $TRUE)]
        [string] $Uuid,
        [Parameter(Mandatory = $TRUE)]
        [string] $LocalToken
    )
    $Key = HiWifi-Calc-Cloud-Token-Key-Hex -Uuid $Uuid
    $Data = HiWifi-Calc-Cloud-Token-Data-Utf8 -LocalToken $LocalToken
    $HmacSha1 = New-Object System.Security.Cryptography.HMACSHA1
    $HmacSha1.key = [System.Convert]::FromHexString($Key)
    $Hash1 = $HmacSha1.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Data))
    $Result = [System.Convert]::ToBase64String($Hash1)
    return $Result;
}

function HiWifi-Calc-Cloud-Token-Key-Hex() {
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

function HiWifi-Calc-Cloud-Token-Data-Utf8() {
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