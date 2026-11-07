# -----------------------------------------------------------------------------
# 函数 1: 获取所有分区的 Volume 列表
# -----------------------------------------------------------------------------
function Drive-ListVolume {
    [CmdletBinding()]
    param()

    $diskByNumber = @{}
    Get-Disk | ForEach-Object {
        $diskByNumber[$_.Number] = $_
    }

    # DeviceId 与 Get-Disk 的 Number 对应，用字符串做键避免 UInt32/Int32 的类型差异
    $physicalDiskByNumber = @{}
    Get-PhysicalDisk | ForEach-Object {
        $physicalDiskByNumber[$_.DeviceId.Trim()] = $_
    }

    $volumeByGuid = @{}
    Get-Volume | ForEach-Object {
        if ($_.UniqueId -match '\{([0-9a-fA-F-]+)\}') {
            $volumeByGuid[$matches[1].ToLower()] = $_
        }
    }

    # 分区的 Guid 与卷的 UniqueId (\\?\Volume{GUID}\) 一一对应
    $getVolume = {
        param($Partition)

        $guid = $Partition.Guid
        if (-not $guid) {
            return $null
        }
        return $volumeByGuid[$guid.Trim('{}').ToLower()]
    }

    Get-Partition |
    #Where-Object { $_.AccessPaths -ne $null -and $_.Guid -ne $null }  |
    Sort-Object DiskNumber, PartitionNumber |
    Format-Table -AutoSize -Property @{
        Label      = 'Disk';
        Expression = {
            if ($diskByNumber.ContainsKey($_.DiskNumber)) {
                $diskByNumber[$_.DiskNumber].FriendlyName
            }
        };
        Alignment  = 'Left'
    }, @{
        Label      = 'Media';
        Expression = {
            $physicalDisk = $physicalDiskByNumber["$($_.DiskNumber)"]
            if ($physicalDisk -and $physicalDisk.MediaType -ne 'Unspecified') {
                $physicalDisk.MediaType
            }
        }
    }, @{
        Label      = 'Bus';
        Expression = {
            if ($diskByNumber.ContainsKey($_.DiskNumber)) {
                $diskByNumber[$_.DiskNumber].BusType
            }
        }
    }, @{
        Label      = 'Style';
        Expression = {
            if ($diskByNumber.ContainsKey($_.DiskNumber)) {
                $diskByNumber[$_.DiskNumber].PartitionStyle
            }
        }
    }, @{
        Label      = 'Drive';
        Expression = { $_.DriveLetter ? $_.DriveLetter : " " };
        Alignment  = 'Right'
    }, @{
        Label      = 'Label';
        Expression = {
            $volume = & $getVolume $_
            if ($volume -and $volume.FileSystemLabel) {
                $volume.FileSystemLabel
            }
            else {
                $_.Type
            }
        }
    }, @{
        Label      = 'Status';
        Expression = { $_.OperationalStatus }
    }, @{
        Name       = 'Size';
        Expression = { Format-Bytes $_.Size };
        Alignment  = 'Right'
    }, @{
        Label      = 'Volume';
        Expression = {
            $volume = & $getVolume $_
            "{0}.{1} {2}" -f $_.DiskNumber, $_.PartitionNumber, $volume.FileSystemType
        }
    }, @{
        Label      = 'Volume Guid';
        Expression = { $_.Guid.trim("{}") }
    }
}

# -----------------------------------------------------------------------------
# 函数 2: 根据 Volume GUID 分配盘符
# -----------------------------------------------------------------------------
function Drive-AssignLetterByGuid {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory = $true)]
        [string]$VolumeGuid,

        [Parameter(Mandatory = $true)]
        [ValidatePattern("^[A-Z]$")]
        [string]$DriveLetter
    )

    try {
        # 1. 查找对应的分区对象
        $partition = Get-Partition | Where-Object {
            $_.AccessPaths -like "*$VolumeGuid*"
        }

        if (-not $partition) {
            throw "未找到 Volume GUID 为 $VolumeGuid 的分区。请检查 GUID 是否正确。"
        }

        if ($partition.DriveLetter) {
            Write-Warning "该分区当前已分配盘符: $($partition.DriveLetter):"
            #$confirm = Read-Host "是否覆盖原有盘符并分配为 ${DriveLetter}: ? (Y/N)"
            #if ($confirm -ne 'Y') { return }
            return
        }

        # 2. 执行分配
        Set-Partition -InputObject $partition -NewDriveLetter $DriveLetter

        Write-Host "✅ 成功: 已将盘符 ${DriveLetter}: 分配给 GUID $VolumeGuid" -ForegroundColor Green
    }
    catch {
        Write-Error "❌ 失败: $_"
    }
}

# -----------------------------------------------------------------------------
# 函数 3: 根据 Volume GUID 移除盘符
# -----------------------------------------------------------------------------
function Drive-RemoveLetterByGuid {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory = $true)]
        [string]$VolumeGuid
    )

    try {
        # 1. 查找对应的分区对象
        $partition = Get-Partition | Where-Object {
            $_.AccessPaths -like "*$VolumeGuid*"
        }

        if (-not $partition) {
            throw "未找到 Volume GUID 为 $VolumeGuid 的分区。"
        }

        if (-not $partition.DriveLetter) {
            Write-Warning "该分区当前没有分配盘符，无需移除。"
            return
        }

        $currentLetter = $partition.DriveLetter
        $accessPath = "${currentLetter}:\"

        # 2. 执行移除
        Remove-PartitionAccessPath -InputObject $partition -AccessPath $accessPath

        Write-Host "✅ 成功: 已移除 GUID $VolumeGuid 的盘符 ${currentLetter}:" -ForegroundColor Yellow
    }
    catch {
        Write-Error "❌ 失败: $_"
    }
}