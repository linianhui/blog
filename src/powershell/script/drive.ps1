# -----------------------------------------------------------------------------
# 函数 0: 获取分区的 Volume GUID
# -----------------------------------------------------------------------------
function Drive-Get-Volume-Guid-From-Partition {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        $Partition
    )

    # GPT 分区有 Guid; MBR 分区没有 Guid，只能从 AccessPaths (\\?\Volume{GUID}\) 中解析
    if ($Partition.Guid) {
        return $Partition.Guid.Trim('{}')
    }

    foreach ($accessPath in $Partition.AccessPaths) {
        if ($accessPath -match 'Volume\{([0-9a-fA-F-]+)\}') {
            return $matches[1]
        }
    }

    return $null
}

# -----------------------------------------------------------------------------
# 函数 1: 获取所有分区的 Volume 列表
# -----------------------------------------------------------------------------
function Drive-List-Volume {
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
        $guid = Drive-Get-Volume-Guid-From-Partition -Partition $Partition
        if (-not $guid) {
            return $null
        }
        return $volumeByGuid[$guid.ToLower()]
    }

    Get-Partition |
    #Where-Object { $_.AccessPaths -ne $null -and $_.Guid -ne $null }  |
    Sort-Object DiskNumber, PartitionNumber |
    Format-Table -AutoSize -Property @{
        Label      = '#';
        Expression = {
            # DriveLetter 没有盘符时是 [char]0，直接格式化会写入 NUL 字符，导致后续列错位
            $letter = $_.DriveLetter ? $_.DriveLetter : " "
            "{0}.{1} {2}" -f $_.DiskNumber, $_.PartitionNumber, $letter
        };
        Alignment  = 'Left'
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
        };
        Alignment  = 'Right'
    }, @{
        Name       = 'Size';
        Expression = { Format-Byte -Value $_.Size -Split ' ' };
        Alignment  = 'Right'
    }, @{
        Label      = 'FS';
        Expression = {
            $volume = & $getVolume $_
            $volume.FileSystemType
        }
    }, @{
        Label      = 'Volume Guid';
        Expression = { Drive-Get-Volume-Guid-From-Partition -Partition $_ }
    }, @{
        Label      = 'Status';
        Expression = { $_.OperationalStatus }
    }, @{
        Label      = 'Disk Friendly Name';
        Expression = {
            if ($diskByNumber.ContainsKey($_.DiskNumber)) {
                $diskByNumber[$_.DiskNumber].FriendlyName
            }
        };
        Alignment  = 'Left'
    }, @{
        Label      = 'Type';
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
        Label      = 'Part';
        Expression = {
            if ($diskByNumber.ContainsKey($_.DiskNumber)) {
                $diskByNumber[$_.DiskNumber].PartitionStyle
            }
        }
    }
}

# -----------------------------------------------------------------------------
# 函数 2: 根据 Volume GUID 分配盘符
# -----------------------------------------------------------------------------
function Drive-Assign-Letter-By-Guid {
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
function Drive-Remove-Letter-By-Guid {
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

# -----------------------------------------------------------------------------
# 函数 4: 写满指定盘符所在的分区
# -----------------------------------------------------------------------------
function Drive-Fill-Disk {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory = $true)]
        [ValidatePattern('^[A-Za-z]:?$')]
        [string]$Drive,

        # 单个文件的大小(MB)，写满后自动写下一个文件，避免 FAT32 等单文件 4GB 限制
        [ValidateRange(1, 4096)]
        [int]$FileSizeMB = 1024
    )

    $letter = $Drive.Trim().TrimEnd(':').ToUpperInvariant()
    $volume = Get-Volume -DriveLetter $letter -ErrorAction SilentlyContinue
    if (-not $volume) {
        Write-Error "❌ 失败: 未找到盘符 ${letter}: 对应的分区。"
        return
    }

    $root = "${letter}:\"
    if (-not (Test-Path -LiteralPath $root)) {
        Write-Error "❌ 失败: ${root} 不可访问。"
        return
    }

    $label = $volume.FileSystemLabel ? $volume.FileSystemLabel : $volume.FileSystemType
    Write-Warning "即将写满分区 ${root} (${label}，可用 $(Format-Byte -Value $volume.SizeRemaining))，写入期间系统可能变慢。"
    Write-Warning "生成的文件不会被自动删除，需要手工清理 ${root}fill-disk-<序号>-<随机 GUID>.bin。"

    # 第一次确认
    if (-not $PSCmdlet.ShouldProcess($root, '写满该分区')) {
        Write-Host "已取消。" -ForegroundColor Yellow
        return
    }

    # 第二次确认: 必须手工输入盘符
    $confirm = Read-Host "二次确认: 请输入盘符 $letter 以继续"
    if ($confirm.Trim().TrimEnd(':').ToUpperInvariant() -ne $letter) {
        Write-Host "输入的盘符不匹配，已取消。" -ForegroundColor Yellow
        return
    }

    $chunk = New-Object byte[] (1MB)
    $maxFileSize = [long]$FileSizeMB * 1MB
    # 每次执行随机生成一个 GUID，保证不会与之前生成的文件重名
    $runGuid = [guid]::NewGuid().ToString()
    $fileIndex = 0
    $fileCount = 0
    $totalBytes = [long]0
    $stream = $null
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    try {
        while ($true) {
            $filePath = Join-Path $root ('fill-disk-{0:D6}-{1}.bin' -f $fileIndex, $runGuid)
            $fileIndex++

            # CreateNew 保证不会覆盖分区上已有的同名文件
            $stream = [System.IO.File]::Open($filePath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
            $fileCount++

            $fileBytes = [long]0
            while ($fileBytes -lt $maxFileSize) {
                $stream.Write($chunk, 0, $chunk.Length)
                $fileBytes += $chunk.Length
                $totalBytes += $chunk.Length
            }

            $stream.Dispose()
            $stream = $null
        }
    }
    catch [System.IO.IOException] {
        # ERROR_DISK_FULL(112) / ERROR_HANDLE_DISK_FULL(39) 表示分区已经写满
        if ($_.Exception.HResult -eq -2147024784 -or $_.Exception.HResult -eq -2147024857) {
            Write-Host "✅ 完成: 分区 ${root} 已写满。" -ForegroundColor Green
        }
        else {
            Write-Error "❌ 失败: $($_.Exception.Message)"
        }
    }
    catch {
        Write-Error "❌ 失败: $($_.Exception.Message)"
    }
    finally {
        if ($stream) {
            $stream.Dispose()
        }

        $stopwatch.Stop()
        $remaining = (Get-Volume -DriveLetter $letter).SizeRemaining
        Write-Host ("写入 {0} 个文件，共 {1}，耗时 {2}，剩余可用空间 {3}" -f $fileCount, (Format-Byte -Value $totalBytes), $stopwatch.Elapsed, (Format-Byte -Value $remaining))
    }
}