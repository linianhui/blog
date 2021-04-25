################################
# powershell alias functions
################################


Set-Alias -Name c -Value Code-ChangeDirectory
Set-Alias -Name cc -Value Code-UseVsCodeOpenDirectory

Set-Alias -Name d -Value docker
Set-Alias -Name dr -Value Docker-Run
Set-Alias -Name dre -Value Docker-Run-entrypoint
Set-Alias -Name drs -Value Docker-Run-entrypoint-sh
Set-Alias -Name drb -Value Docker-Run-entrypoint-bash
Set-Alias -Name dc -Value docker-compose
Set-Alias -Name dm -Value docker-machine
Set-Alias -Name k8s -Value kubectl
Set-Alias -Name mk -Value minikube

Set-Alias -Name e -Value Gui-OpenExplorer

Set-Alias -Name g -Value git

Set-Alias -Name gti -Value git

Set-Alias -Name hs -Value http-server

Set-Alias -Name hus -Value hugo-server

Set-Alias -Name env -Value Env-GetAllVariable

Set-Alias -Name path -Value Env-GetPathVariavle

Set-Alias -Name yj -Value Yaml-ToJson

Set-Alias -Name jy -Value Yaml-FromJson

Set-Alias -Name grep -Value Select-String

Set-Alias -Name k8sgtp -Value Kubernetes-GetTerminatedPod