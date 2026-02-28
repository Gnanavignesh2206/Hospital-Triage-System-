@echo off
REM Remove merge state files
del /F /Q "c:\Users\GNANA VIGNESH C\Downloads\Hospital-Triage-System\.git\MERGE_HEAD" 2>nul
del /F /Q "c:\Users\GNANA VIGNESH C\Downloads\Hospital-Triage-System\.git\MERGE_MSG" 2>nul
del /F /Q "c:\Users\GNANA VIGNESH C\Downloads\Hospital-Triage-System\.git\MERGE_MODE" 2>nul
echo Merge state files removed

REM Change to project directory and push
cd /d "c:\Users\GNANA VIGNESH C\Downloads\Hospital-Triage-System"
echo Current directory: %cd%
echo.
echo Attempting git push...
git push -f origin main

echo.
echo Push complete!
pause
