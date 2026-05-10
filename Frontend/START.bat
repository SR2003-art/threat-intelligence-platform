@echo off
title Threat Intel Frontend (this PC only)
cd /d "%~dp0"
echo.
echo === Threat Intelligence Platform ===
echo Folder: %CD%
echo.
if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo Install failed. Install Node.js LTS from https://nodejs.org then try again.
    pause
    exit /b 1
  )
)
echo.
echo Starting server for THIS computer...
echo.
echo    >>> Open in Chrome / Edge:  http://127.0.0.1:5173
echo.
echo    Do not open index.html from File Explorer.
echo    Keep this window open while you use the app. Ctrl+C to stop.
echo.
call npm run dev
pause
