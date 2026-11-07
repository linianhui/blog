# -----------------------------------------------------------------------------
# 函数 1: 获取所有分区的 Volume GUID 列表
# -----------------------------------------------------------------------------
function Drive-ListVolumeGuid {
    [CmdletBinding()]
    param()

    Get-Partition |
    Where-Object { $_.AccessPaths -ne $null -and $_.Guid -ne $null }  |
    Sort-Object Size, DriveLetter, Guid |
    Format-Table -AutoSize -Property @{
        Label      = 'Drive';
        Expression = { $_.DriveLetter?$_.DriveLetter: " " }
    }, @{
        Label      = 'Guid';
        Expression = { $_.Guid.trim("{}") }
    }, @{
        Label      = 'Status';
        Expression = { $_.OperationalStatus }
    }, @{
        Name       = "Size";
        Expression = { Format-Bytes $_.Size }
    }, Type
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