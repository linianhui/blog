
# https://github.com/mziyabo/PSKubectlCompletion
function Kubernetes-ImportPSKubectlCompletion () {
    Import-Module -Name PSKubectlCompletion
    Register-KubectlCompletion
}

function Kubernetes-InstallPSKubectlCompletion () {
    Install-Module PSKubectlCompletion
}

function Kubernetes-GetTerminatedPod() {
    kubectl get pods -o custom-columns-file=D:\_code\blog\src\k8s\kubectl\terminated-pod.txt --sort-by='{status.containerStatuses[0].lastState.terminated.finishedAt}' $Args
}