@echo off
title Threat Intel Frontend (phone + same Wi-Fi)
cd /d "%~dp0"
echo.
echo === Threat Intelligence Platform (LAN) ===
echo Folder: %CD%
echo.
if not exist "node_modules\" (
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)
echo Your PC IPv4 addresses (use the Wi-Fi one on your phone):
ipconfig | findstr /i "IPv4"
echo.
echo On your PHONE browser (same Wi-Fi as this PC), open:
echo    http://YOUR_IP_ABOVE:5173
echo    Example: http://192.168.1.5:5173
echo.
echo If it does not load: allow port 5173 in Windows Firewall (run PowerShell as Admin).
echo.
call npm run dev:lan
pause
