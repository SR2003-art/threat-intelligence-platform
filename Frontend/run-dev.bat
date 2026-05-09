@echo off
cd /d "%~dp0"
echo.
echo === Threat Intel Frontend ===
echo Install once: npm install
echo Then opens the app. Use the URL under "Local:" in this window.
echo On your phone (same Wi-Fi): use the URL under "Network:".
echo Full data needs the Java Backend on port 8080 and MySQL running.
echo.
if not exist node_modules (
  echo Installing npm packages...
  call npm install
  if errorlevel 1 exit /b 1
)
call npm run dev
