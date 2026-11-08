################################
# powershell vm(hyper-v) functions
################################

function vm ([string] $name) {
    if ([String]::IsNullOrEmpty($name)) {
        Get-VM
    }
    else {
        Get-VM -Name $name
    }
}

# https://docs.microsoft.com/en-us/powershell/module/hyper-v/new-vhd?view=win10-ps
function vhd-create(
    [string] $Path,
    [uint64] $Size = 128GB
) {
    Console-Debug "New-VHD -Dynamic -Path $Path -SizeBytes $Size"
    New-VHD `
        -Dynamic `
        -Path $Path `
        -SizeBytes $Size
}

# https://www.altaro.com/hyper-v/customize-vm-powershell/
# https://docs.microsoft.com/en-us/powershell/module/hyper-v/new-vm?view=win10-ps
# https://docs.microsoft.com/en-us/powershell/module/hyper-v/set-vm?view=win10-ps
# https://docs.microsoft.com/en-us/powershell/module/hyper-v/set-vmdvddrive?view=win10-ps
# https://learn.microsoft.com/zh-cn/windows-server/virtualization/hyper-v/best-practices-for-running-linux-on-hyper-v
function Vm-From-Json(
    [string] $JsonFilePath
) {
    $NamePadding = 22
    if ((Test-Path -Path $JsonFilePath -PathType Leaf) -eq $False) {
        Console-Debug-Name-Value -Name 'not_found' -NamePadding $NamePadding -Value "$JsonFilePath"
        Console-Debug-Name-Value -Name 'help' -NamePadding $NamePadding -Value 'https://linianhui.github.io/powershell/hyper-v/#config'
        return
    }

    if ((Ui-Test-Administrator) -eq $False) {
        Console-Debug-Name-Value -Name 'no_permission' -NamePadding $NamePadding -Value "need use administrator"
        return
    }

    $Json = Get-Content -Path $JsonFilePath | ConvertFrom-Json

    $VhdPath = ($Json.vhd.path + "\" + $Json.name + ".vhdx")
    if ((Test-Path -Path $VhdPath -PathType Leaf) -eq $False) {
        New-VHD `
            -Dynamic `
            -Path $VhdPath `
            -BlockSizeBytes $Json.vhd.blockSize `
            -SizeBytes $Json.vhd.size | Out-Null
    }

    $VM = Get-VM -Name $Json.name -ErrorAction Ignore
    if ($VM -eq $NULL) {
        New-VM `
            -Name $Json.name `
            -Generation $Json.generation `
            -Path $Json.path `
            -SwitchName $Json.net.switch `
            -VHDPath $VhdPath | Out-Null
    }

    if ($VM.Generation -eq 2) {
        # https://learn.microsoft.com/en-us/powershell/module/hyper-v/set-vmfirmware?view=windowsserver2019-ps
        Set-VMFirmware `
            -VMName $Json.name `
            -EnableSecureBoot $Json.boot.secure
    }

    # https://learn.microsoft.com/en-us/powershell/module/hyper-v/set-vm?view=windowsserver2019-ps
    Set-VM `
        -Name $Json.name `
        -AutomaticStartAction $Json.automatic.start `
        -AutomaticStopAction $Json.automatic.stop `
        -AutomaticCheckpointsEnabled $Json.automatic.checkpoint `
        -CheckpointType $Json.checkpoint.type

    Get-VMIntegrationService -VMName $Json.name | ForEach-Object {
        Enable-VMIntegrationService -VMName $Json.name -Name $_.Name
    }

    # print vm
    $VM = Get-VM -Name $Json.name
    Console-Debug-Name-Value -Name 'name' -NamePadding $NamePadding -Value $VM.Name
    Console-Debug-Name-Value -Name 'generation' -NamePadding $NamePadding -Value $VM.Generation
    Console-Debug-Name-Value -Name 'path' -NamePadding $NamePadding -Value $VM.Path
    Console-Debug-Name-Value -Name 'state' -NamePadding $NamePadding -Value $VM.State
    if ($VM.Generation -eq 2) {
        $VMFirmware = Get-VMFirmware -VMName $Json.name
        Console-Debug-Name-Value -Name 'boot.secure' -NamePadding $NamePadding -Value $VMFirmware.SecureBoot.ToString()
    }
    else {
        Console-Debug-Name-Value -Name 'boot.secure' -NamePadding $NamePadding -Value 'Off'
    }
    Console-Debug-Name-Value -Name 'automatic.start' -NamePadding $NamePadding -Value $VM.AutomaticStartAction
    Console-Debug-Name-Value -Name 'automatic.stop' -NamePadding $NamePadding -Value $VM.AutomaticStopAction
    Console-Debug-Name-Value -Name 'automatic.checkpoint' -NamePadding $NamePadding -Value $VM.AutomaticCheckpointsEnabled
    Console-Debug-Name-Value -Name 'checkpoint.type' -NamePadding $NamePadding -Value $VM.CheckpointType

    # https://learn.microsoft.com/en-us/powershell/module/hyper-v/set-vmprocessor?view=windowsserver2019-ps
    Set-VMProcessor `
        -VMName $Json.name `
        -Count $Json.cpu.count
    $CPU = Get-VMProcessor -VMName $Json.name
    # print cpu
    Console-Debug-Name-Value -Name 'cpu.count' -NamePadding $NamePadding -Value $CPU.Count


    # https://learn.microsoft.com/en-us/powershell/module/hyper-v/set-vmmemory?view=windowsserver2019-ps
    Set-VMMemory `
        -VMName $Json.name `
        -DynamicMemoryEnabled $True `
        -StartupBytes $Json.mem.min `
        -MinimumBytes $Json.mem.min `
        -MaximumBytes $Json.mem.max
    $MEM = Get-VMMemory -VMName $Json.name
    # print mem
    Console-Debug-Name-Value -Name 'mem.dynamic' -NamePadding $NamePadding -Value $MEM.DynamicMemoryEnabled
    Console-Debug-Name-Value -Name 'mem.startup' -NamePadding $NamePadding -Value ($MEM.Startup | Format-Byte)
    Console-Debug-Name-Value -Name 'mem.min' -NamePadding $NamePadding -Value ($MEM.Minimum | Format-Byte)
    Console-Debug-Name-Value -Name 'mem.max' -NamePadding $NamePadding -Value ($MEM.Maximum | Format-Byte)


    if ($Json.net.mac) {
        Set-VMNetworkAdapter `
            -VMName $Json.name `
            -StaticMacAddress $Json.net.mac
    }
    $VM = Get-VM -Name $Json.name
    # print net
    Console-Debug-Name-Value -Name 'net.switch' -NamePadding $NamePadding -Value $VM.NetworkAdapters[0].SwitchName
    Console-Debug-Name-Value -Name 'net.connected' -NamePadding $NamePadding -Value $VM.NetworkAdapters[0].Connected
    Console-Debug-Name-Value -Name 'net.mac' -NamePadding $NamePadding -Value ($VM.NetworkAdapters[0].MacAddress | Format-Mac)


    $VHD = Get-VHD -Path $VhdPath
    $HDD = Get-VMHardDiskDrive -VMName $Json.name
    # print hdd
    Console-Debug-Name-Value -Name 'vhd.type' -NamePadding $NamePadding -Value $VHD.VhdType
    Console-Debug-Name-Value -Name 'vhd.path' -NamePadding $NamePadding -Value $VHD.Path
    Console-Debug-Name-Value -Name 'vhd.format' -NamePadding $NamePadding -Value $VHD.VhdFormat
    Console-Debug-Name-Value -Name 'vhd.size' -NamePadding $NamePadding -Value ($VHD.Size | Format-Byte)
    Console-Debug-Name-Value -Name 'vhd.blocksize' -NamePadding $NamePadding -Value ($VHD.BlockSize | Format-Byte)
    Console-Debug-Name-Value -Name 'vhd.fileSize' -NamePadding $NamePadding -Value ($VHD.FileSize | Format-Byte)
    Console-Debug-Name-Value -Name 'vhd.controllerType' -NamePadding $NamePadding -Value $HDD.ControllerType
    Console-Debug-Name-Value -Name 'vhd.controllerNumber' -NamePadding $NamePadding -Value $HDD.ControllerNumber
    Console-Debug-Name-Value -Name 'vhd.controllerLocation' -NamePadding $NamePadding -Value $HDD.ControllerLocation


    if ($Json.dvd.iso) {
        if (Test-Path -Path $Json.dvd.iso -PathType Leaf) {
            if ((Get-VMDvdDrive -VMName $Json.name) -eq $Null) {
                Add-VMDvdDrive `
                    -VMName $Json.name `
                    -Path $Json.dvd.iso`
                    -ErrorAction Ignore
            }
        }
        $DVD = Get-VMDvdDrive -VMName $Json.name
        if ($DVD.Path) {
            # print dvd
            Console-Debug-Name-Value -Name 'dvd.type' -NamePadding $NamePadding -Value $DVD.DvdMediaType
            Console-Debug-Name-Value -Name 'dvd.path' -NamePadding $NamePadding -Value $DVD.Path
            Console-Debug-Name-Value -Name 'dvd.fileSize' -NamePadding $NamePadding -Value ((Get-Item $DVD.Path).Length | Format-Byte)
            Console-Debug-Name-Value -Name 'dvd.controllerType' -NamePadding $NamePadding -Value $DVD.ControllerType
            Console-Debug-Name-Value -Name 'dvd.controllerNumber' -NamePadding $NamePadding -Value $DVD.ControllerNumber
            Console-Debug-Name-Value -Name 'dvd.controllerLocation' -NamePadding $NamePadding -Value $DVD.ControllerLocation
        }
    }
}


function Vm-To-Json() {
    param (
        [string] $VMName = $(throw "VMName is null!")
    )

    $NamePadding = 22

    if ((Ui-Test-Administrator) -eq $False) {
        Console-Debug-Name-Value -Name 'no_permission' -NamePadding $NamePadding -Value 'need use administrator'
        return
    }

    $VM = Get-VM -Name $VMName -ErrorAction Ignore
    if ($VM -eq $NULL) {
        Console-Debug-Name-Value -Name 'not_found' -NamePadding $NamePadding -Value $VMName
        return
    }

    $AutomaticJson = [ordered]@{
        'start'      = $VM.AutomaticStartAction.ToString()
        'stop'       = $VM.AutomaticStopAction.ToString()
        'checkpoint' = $VM.AutomaticCheckpointsEnabled
    }

    $CheckpointJson = [ordered]@{
        'type' = $VM.CheckpointType.ToString()
    }

    $BootJson = [ordered]@{
        'secure' = 'Off'
    }
    if ($VM.Generation -eq 2) {
        $Boot = Get-VMFirmware -VMName $VM.Name
        $BootJson.secure = $Boot.SecureBoot.ToString()
    }

    $Cpu = Get-VMProcessor -VMName $VM.Name
    $CpuJson = [ordered]@{
        'count' = $Cpu.Count
    }

    $Mem = Get-VMMemory -VMName $VM.Name
    $MemJson = [ordered]@{
        'min' = ($Mem.Minimum | Format-Byte)
        'max' = ($Mem.Maximum | Format-Byte)
    }

    $NetJson = [ordered]@{
        'switch' = $VM.NetworkAdapters[0].SwitchName
        'mac'    = ($VM.NetworkAdapters[0].MacAddress | Format-Mac)
    }

    $VhdPath = (Get-VMHardDiskDrive -VMName $VM.Name)[0].Path
    $Vhd = Get-VHD -Path $VhdPath
    $VhdJson = [ordered]@{
        'path'      = (Get-ChildItem -Path $Vhd.Path).DirectoryName.ToLower()
        'size'      = ($Vhd.Size | Format-Byte)
        'blockSize' = ($Vhd.BlockSize | Format-Byte)
    }

    $Dvd = Get-VMDvdDrive -VMName $VM.Name
    $DvdJson = [ordered]@{
        "iso" = $Dvd.Path?.ToLower()
    }

    $Json = [ordered]@{
        'name'       = $VM.Name
        'generation' = $VM.Generation
        'path'       = $VM.Path.ToLower()
        'automatic'  = $AutomaticJson
        'boot'       = $BootJson
        'checkpoint' = $CheckpointJson
        'cpu'        = $CpuJson
        'mem'        = $MemJson
        'net'        = $NetJson
        'vhd'        = $VhdJson
        'dvd'        = $DvdJson
    }

    $Json | ConvertTo-Json
}

function vm-run ([string] $name) {
    if ((Ui-Test-Administrator) -eq $False) {
        Console-Debug-Name-Value -Name 'no_permission' -NamePadding 20 -Value 'use administrator run vm'
        return
    }
    Get-VM -Name $name | Start-VM
}

function vm-stop ([string] $name) {
    if ((Ui-Test-Administrator) -eq $False) {
        Console-Debug-Name-Value -Name 'no_permission' -NamePadding 10 -Value 'use administrator stop vm'
        return
    }
    Get-VM -Name $name | Stop-VM
}

function vm-ssh (
    [string]$username,
    [string]$hostname,
    [string]$port = 22) {

    Console-Debug "run [$hostname] hyper-v vm"
    vm-run -name $hostname

    Console-Debug "ssh $username@$hostname -p $port"
    ssh "$username@$hostname" -p $port
}

function ubt1 () {
    vm-ssh -username root -hostname ubt1
}

function ubt2 () {
    vm-ssh -username root -hostname ubt2
}

function ubt3 () {
    vm-ssh -username root -hostname ubt3
}

function ceos () {
    vm-ssh -username root -hostname ceos
}

function deb1 () {
    vm-ssh -username root -hostname deb1
}

function deb2 () {
    vm-ssh -username root -hostname deb2
}

function deb3 () {
    vm-ssh -username root -hostname deb3
}