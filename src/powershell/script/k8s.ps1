
# https://github.com/mziyabo/PSKubectlCompletion
function Kubernetes-Import-PS-Kubectl-Completion () {
    Import-Module -Name PSKubectlCompletion
    Register-KubectlCompletion
}

function Kubernetes-Install-PS-Kubectl-Completion () {
    Install-Module PSKubectlCompletion
}

function Kubernetes-Get-Terminated-Pod() {
    kubectl get pods -o custom-columns-file=D:\_code\blog\src\k8s\kubectl\terminated-pod.txt --sort-by='{status.containerStatuses[0].lastState.terminated.finishedAt}' $Args
}