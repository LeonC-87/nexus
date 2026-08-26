# Run this in an ELEVATED PowerShell window (Right-click PowerShell -> Run as Administrator).
# Enables Windows Developer Mode, which grants normal (non-admin) processes the
# SeCreateSymbolicLinkPrivilege needed for electron-builder to extract its bundled
# signing tools. One-time, persistent - future `npm run dist` builds won't need
# elevation after this.

$ErrorActionPreference = "Stop"
try {
    $key = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock"
    if (-not (Test-Path $key)) {
        New-Item -Path $key -Force | Out-Null
    }
    Set-ItemProperty -Path $key -Name "AllowDevelopmentWithoutDevLicense" -Value 1 -Type DWord
    Write-Host "Developer Mode enabled." -ForegroundColor Green
    Write-Host "Verify:" -ForegroundColor Cyan
    Get-ItemProperty -Path $key -Name "AllowDevelopmentWithoutDevLicense"
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
Read-Host "Press Enter to close"
