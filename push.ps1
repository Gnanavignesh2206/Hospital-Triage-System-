#!/usr/bin/env pwsh
Set-Location "c:\Users\GNANA VIGNESH C\Downloads\Hospital-Triage-System"
Write-Host "Current directory: $(Get-Location)"
Write-Host "Checking git status..."
git status
Write-Host "Attempting force push..."
git push -f origin main
Write-Host "Push complete"
