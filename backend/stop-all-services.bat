@echo off
echo Stopping all SSMail services...
echo.

REM Stop processes using port 3001 (Mail Server)
echo Stopping Mail Server (port 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Stop processes using port 5000 (Phishing Detector)
echo Stopping Phishing Detector (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM Stop any node processes with "server.js"
echo Stopping node server processes...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Mail Server*" >nul 2>&1

REM Stop any python processes with "phishing_detector"
echo Stopping python detector processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq Phishing Detector*" >nul 2>&1

echo.
echo ✅ All services stopped!
echo.
pause
