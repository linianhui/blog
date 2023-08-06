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
    Log-Debug "New-VHD -Dynamic -Path $Path -SizeBytes $Size"
    New-VHD `
        -Dynamic `
        -Path $Path `
        -SizeBytes $Size
}

# https://docs.microsoft.com/en-us/powershell/module/hyper-v/new-vm?view=win10-ps
# https://docs.microsoft.com/en-us/powershell/module/hyper-v/set-vm?view=win10-ps
# https://docs.microsoft.com/en-us/powershell/module/hyper-v/set-vmdvddrive?view=win10-ps
function vm-from-json(
    [string] $JsonFilePath
) {
    $NamePadding = 30
    if (Ui-Test-Administrator) {
        if ($JsonFilePath) {
            $Json = Get-Content -Path $JsonFilePath | ConvertFrom-Json


            $VM = Get-VM -Name $Json.name -ErrorAction Ignore
            if (!$VM) {
                New-VM `
                    -Name $Json.name `
                    -Generation $Json.generation `
                    -Path $Json.path `
                    -SwitchName $Json.network.switchName | Out-Null

            }
            $VM = Get-VM -Name $Json.name
            Set-VM `
                -Name $Json.name `
                -AutomaticStartAction $Json.automatic.startAction `
                -AutomaticStopAction $Json.automatic.stopAction `
                -CheckpointType $Json.checkpoint.type
            # print vm
            Log-NameValue -Name 'name' -NamePadding $NamePadding -Value $VM.Name
            Log-NameValue -Name 'generation' -NamePadding $NamePadding -Value $VM.Generation
            Log-NameValue -Name 'path' -NamePadding $NamePadding -Value $VM.Path
            Log-NameValue -Name 'state' -NamePadding $NamePadding -Value $VM.State
            Log-NameValue -Name 'automatic.startAction' -NamePadding $NamePadding -Value $VM.AutomaticStartAction
            Log-NameValue -Name 'automatic.stopAction' -NamePadding $NamePadding -Value $VM.AutomaticStopAction
            Log-NameValue -Name 'checkpoint.type' -NamePadding $NamePadding -Value $VM.CheckpointType

            Set-VMProcessor `
                -VMName $Json.name `
                -Count $Json.cpu.count
            $CPU = Get-VMProcessor -VMName $Json.name
            # print cpu
            Log-NameValue -Name 'cpu.count' -NamePadding $NamePadding -Value $CPU.Count


            Set-VMMemory `
                -VMName $Json.name `
                -DynamicMemoryEnabled $Json.mem.dynamic `
                -StartupBytes $Json.mem.startup `
                -MinimumBytes $Json.mem.min `
                -MaximumBytes $Json.mem.max
            $MEM = Get-VMMemory -VMName $Json.name
            # print mem
            Log-NameValue -Name 'mem.dynamic' -NamePadding $NamePadding -Value $MEM.DynamicMemoryEnabled
            Log-NameValue -Name 'mem.startup' -NamePadding $NamePadding -Value ($MEM.Startup | Byte-Format)
            Log-NameValue -Name 'mem.min' -NamePadding $NamePadding -Value ($MEM.Minimum | Byte-Format)
            Log-NameValue -Name 'mem.max' -NamePadding $NamePadding -Value ($MEM.Maximum | Byte-Format)


            if ($Json.network.macAddress) {
                Set-VMNetworkAdapter `
                    -VMName $Json.name `
                    -StaticMacAddress $Json.network.macAddress
            }
            $VM = Get-VM -Name $Json.name
            # print network
            Log-NameValue -Name 'network.switchName' -NamePadding $NamePadding -Value $VM.NetworkAdapters[0].SwitchName
            Log-NameValue -Name 'network.connected' -NamePadding $NamePadding -Value $VM.NetworkAdapters[0].Connected
            Log-NameValue -Name 'network.macAddress' -NamePadding $NamePadding -Value $VM.NetworkAdapters[0].MacAddress


            $vhdPath = ($Json.vhd.path + "\" + $Json.name + ".vhdx")
            if (!(Test-Path -Path $vhdPath -PathType Leaf)) {
                New-VHD `
                    -Dynamic `
                    -Path $vhdPath `
                    -SizeBytes $Json.vhd.size | Out-Null
            }
            $VHD = Get-VHD -Path $vhdPath
            Add-VMHardDiskDrive `
                -VMName $Json.name `
                -Path $VHD.Path `
                -ControllerType IDE `
                -ControllerNumber 0 `
                -ControllerLocation 0 `
                -ErrorAction Ignore
            $HDD = Get-VMHardDiskDrive -VMName $Json.name
            # print hdd
            Log-NameValue -Name 'hdd.type' -NamePadding $NamePadding -Value $VHD.VhdType
            Log-NameValue -Name 'hdd.path' -NamePadding $NamePadding -Value $VHD.Path
            Log-NameValue -Name 'hdd.format' -NamePadding $NamePadding -Value $VHD.VhdFormat
            Log-NameValue -Name 'hdd.fileSize' -NamePadding $NamePadding -Value ($VHD.FileSize | Byte-Format)
            Log-NameValue -Name 'hdd.size' -NamePadding $NamePadding -Value ($VHD.Size | Byte-Format)
            Log-NameValue -Name 'hdd.controllerType' -NamePadding $NamePadding -Value $HDD.ControllerType
            Log-NameValue -Name 'hdd.controllerNumber' -NamePadding $NamePadding -Value $HDD.ControllerNumber
            Log-NameValue -Name 'hdd.controllerLocation' -NamePadding $NamePadding -Value $HDD.ControllerLocation


            if (Test-Path -Path $Json.dvd.iso -PathType Leaf) {
                Add-VMDvdDrive `
                    -VMName $Json.name `
                    -Path $Json.dvd.iso`
                    -ControllerNumber 0 `
                    -ControllerLocation 1
            }
            $DVD = Get-VMDvdDrive -VMName $Json.name
            # print dvd
            Log-NameValue -Name 'dvd.type' -NamePadding $NamePadding -Value $DVD.DvdMediaType
            Log-NameValue -Name 'dvd.path' -NamePadding $NamePadding -Value $DVD.Path
            Log-NameValue -Name 'dvd.fileSize' -NamePadding $NamePadding -Value ((Get-Item $DVD.Path).Length | Byte-Format)
            Log-NameValue -Name 'dvd.controllerType' -NamePadding $NamePadding -Value $DVD.ControllerType
            Log-NameValue -Name 'dvd.controllerNumber' -NamePadding $NamePadding -Value $DVD.ControllerNumber
            Log-NameValue -Name 'dvd.controllerLocation' -NamePadding $NamePadding -Value $DVD.ControllerLocation
        }
        else {
            Log-Info "get default from https://linianhui.github.io/powershell/hyper-v/vm.json"
            $Response = (Invoke-WebRequest -Uri https://linianhui.github.io/powershell/hyper-v/vm.json)
            Log-Debug $Response.Content
        }
    }
    else {
        Log-Warn 'use administrator run'
    }
}

function vm-run ([string] $name) {
    Get-VM -Name $name | Start-VM
}

function vm-stop ([string] $name) {
    Get-VM -Name $name | Stop-VM
}

function vm-ssh (
    [string]$username,
    [string]$hostname,
    [string]$port = 22) {

    Log-Debug "run [$hostname] hyper-v vm"
    vm-run -name $hostname

    Log-Debug "ssh $username@$hostname -p $port"
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