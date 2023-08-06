#####################################################
# current user powershell profile entry script file.
#####################################################

# params
Param(
    [switch]$Init = $False,
    [string]$GitUserName = 'lnh',
    [string]$GitUserEmail = 'lnhdyx@outlook.com'
)

@(
    '/function.ps1',
    '/log.ps1',
    '/convert.ps1',
    '/env.ps1',
    '/file.ps1',
    '/git.ps1',
    '/vscode.ps1',
    '/gui.ps1',
    '/hosts.ps1',
    '/profile.ps1',
    '/prompt.ps1',
    '/sln.ps1',
    '/ui.ps1',
    '/vm.ps1',
    '/http.ps1',
    '/yaml.ps1',
    '/ip.ps1',
    '/k8s.ps1',
    '/docker.ps1',
    '/hugo.ps1',
    '/java.ps1',
    '/wlan.ps1',
    '/directory.ps1',
    '/idea.ps1',
    '/auto-complete.ps1',
    '/alias.ps1'
) | Foreach-Object { . "$PSScriptRoot$_" }

if ($Init) {

    Profile-AddScriptFile -ProfilePath $PROFILE -ScriptFilePath $PSCOMMANDPATH

    Git-SetGlobalAlias

    Git-SetGlobalConfig

    Git-SetGlobalUser -UserName $GitUserName -UserEmail $GitUserEmail

    Git-GetConfig

    Update-Help
}

Git-ImportPoshGit

Kubernetes-ImportPSKubectlCompletion

UI-SetDisplayOptions

Write-Host "Get-ExecutionPolicy $(Get-ExecutionPolicy)" -ForegroundColor Green