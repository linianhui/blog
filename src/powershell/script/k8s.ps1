function Kubernetes-GetTerminatedPod() {
    kubectl get pods -o custom-columns-file=D:\.code\blog\src\k8s\kubectl\terminated-pod.txt --sort-by='{status.containerStatuses[0].lastState.terminated.finishedAt}' $Args
}