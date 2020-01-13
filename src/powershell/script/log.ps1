function Log-Warn() {
    Write-Host $Args -ForegroundColor Yellow
}

function Log-Debug() {
    Write-Host $Args -ForegroundColor Green
}

function Log-Info() {
    Write-Host $Args -ForegroundColor Gray
}