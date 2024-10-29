---
title: '[PowerShell] Hyper-V'
created_at: 2017-07-29 09:42:01
tag: ["PowerShell", "ExecutionPolicy"]
toc: true
---

# 1 Enable Hyper-V {#enable-hyper-v}


```powershell
Enable-WindowsOptionalFeature -Online -FeatureName:Microsoft-Hyper-V -All
```

https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v#enable-hyper-v-using-powershell


# 2 Create virtual switch {#create-virtual-switch}


```powershell
$NetNetAdapter = (Get-NetAdapter)[0]
New-VMSwitch -Name 'External Virtual Network Switch' -NetAdapterName $NetNetAdapter.Name -AllowManagementOS $TRUE
```

https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/connect-to-network
https://docs.microsoft.com/en-us/powershell/module/hyper-v/new-vmswitch?view=win10-ps


# 3 Create virtual hard disk {#create-virtual-hard-disk}


```powershell
$VHDFilePath = 'd:\test.vhdx'
New-VHD -Path $VHDFilePath -Dynamic -SizeBytes 32GB
```

```bash
# 回收文件系统中未使用的块资源
fstrim /
```

https://docs.microsoft.com/en-us/powershell/module/hyper-v/new-vhd?view=win10-ps


# 4 Create virtual machine {#create-virtual-machine}

```powershell
$VMName = 'test_vm'
$VMPath = "d:\$VMName"
$VMSwitch = 'External Virtual Network Switch'
$InstallMedia = 'd:\en_windows_server_2016_x64_dvd_9718492.iso'
$VHDFilePath = 'd:\test.vhdx'

# Create New Virtual Machine
New-VM -Name $VMName -Generation 2 -VHDPath $VHDFilePath -SwitchName $VMSwitch -MemoryStartupBytes 2147483648 -Path $VMPath

# Add DVD Drive to Virtual Machine
Add-VMScsiController -VMName $VMName
Add-VMDvdDrive -VMName $VMName -ControllerNumber 1 -ControllerLocation 0 -Path $InstallMedia

# Mount Installation Media
$DVDDrive = Get-VMDvdDrive -VMName $VMName

# Configure Virtual Machine to Boot from DVD
Set-VMFirmware -VMName $VMName -FirstBootDevice $DVDDrive
```

# 5 config {#config}

```pwsh
# linux
Vm-From-Json -JsonFilePath D:\_code\blog\src\powershell\hyper-v\linux.json

# windows
Vm-From-Json -JsonFilePath D:\_code\blog\src\powershell\hyper-v\windows.json
```

{{<highlight-files title="Hyper-V Json"  regex="^.*\.json$" lang="json">}}


# 6 参考引用 {#reference}

https://docs.microsoft.com/en-us/virtualization/index#pivot=main&panel=server

https://docs.microsoft.com/en-us/windows-server/virtualization/hyper-v/hyper-v-on-windows-server

https://docs.microsoft.com/en-us/windows-server/virtualization/hyper-v/plan/should-i-create-a-generation-1-or-2-virtual-machine-in-hyper-v

https://docs.microsoft.com/en-us/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines

https://docs.microsoft.com/en-us/windows-server/administration/performance-tuning/role/hyper-v-server/
