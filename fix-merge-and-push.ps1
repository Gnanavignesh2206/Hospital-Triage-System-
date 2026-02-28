#!/usr/bin/env pwsh
$ErrorActionPreference = "Continue"

# Set location
Set-Location "c:\Users\GNANA VIGNESH C\Downloads\Hospital-Triage-System" -ErrorAction Stop

Write-Host "========================================" 
Write-Host "Git Merge Fix and Push Script"
Write-Host "========================================`n"

Write-Host "Step 1: Killing potential lock-holding processes..."
Get-Process -Name "git" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "vim" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Done.`n"

Write-Host "Step 2: Removing merge state files..."
$files = @(
    ".git\MERGE_HEAD",
    ".git\MERGE_MSG", 
    ".git\MERGE_MODE",
    ".git\.MERGE_MSG.swp",
    ".git\AUTO_MERGE"
)

foreach ($file in $files) {
    $fullPath = Join-Path (Get-Location) $file
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force -ErrorAction Stop
            Write-Host "  ✓ Removed: $file"
        } catch {
            Write-Host "  ✗ Failed to remove $file - $(${Error}[0].Exception.Message)"
        }
    } else {
        Write-Host "  - Not found: $file"
    }
}
Write-Host "`nDone.`n"

Write-Host "Step 3: Checking git status..."
& git status
Write-Host "`n"

Write-Host "Step 4: Force pushing to GitHub..."
& git push -f origin main
Write-Host "`n"

Write-Host "========================================" 
Write-Host "Script Complete!"
Write-Host "========================================"
