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
    Log-Debug "New-VHD -Path $Path -Dynamic -SizeBytes $Size"
    New-VHD `
        -Path $Path `
    -Dynamic `
        -SizeBytes $Size
}

# https://docs.microsoft.com/en-us/powershell/module/hyper-v/new-vm?view=win10-ps
# https://docs.microsoft.com/en-us/powershell/module/hyper-v/set-vm?view=win10-ps
# https://docs.microsoft.com/en-us/powershell/module/hyper-v/set-vmdvddrive?view=win10-ps
function vm-create(
    [string] $VMName,
    [string] $Path = 'e:\.vm',
    [string] $ISO
) {

    Log-Debug "New-VM -Name $VMName -Path $Path -Generation 1 -SwitchName 'HVS' -NewVHDPath "$Path\$VMName\disk.vhdx" -NewVHDSizeBytes 128GB"
    New-VM `
        -Name $VMName `
        -Path $Path `
        -Generation 1 `
        -SwitchName 'HVS' `
        -NewVHDPath "$Path\$VMName\disk.vhdx" `
        -NewVHDSizeBytes 128GB

    Log-Debug "Set-VMProcessor -VMName $VMName -Count 2"
    Set-VMProcessor `
        -VMName $VMName `
        -Count 2

    Log-Debug "Set-VMMemory -VMName $VMName -DynamicMemoryEnabled $TRUE -StartupBytes 1GB -MinimumBytes 1GB -MaximumBytes 4GB"
    Set-VMMemory `
        -VMName $VMName `
        -DynamicMemoryEnabled $TRUE `
        -StartupBytes 1GB `
        -MinimumBytes 1GB `
        -MaximumBytes 4GB

    if ($ISO) {
        Log-Debug "Set-VMDvdDrive -VMName $VMName -Path $ISO"
        Set-VMDvdDrive `
            -VMName $VMName `
            -Path $ISO
    }

    Log-Debug "Set-VM -Name $VMName -AutomaticStartAction 'Nothing' -AutomaticStopAction 'ShutDown' -CheckpointType 'Disabled'"
    Set-VM `
        -Name $VMName `
        -AutomaticStartAction 'Nothing' `
        -AutomaticStopAction 'ShutDown' `
        -CheckpointType 'Disabled'
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