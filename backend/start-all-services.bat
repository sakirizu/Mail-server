@echo off
echo ===============================================
echo  SSMail Backend with Phishing Detection
echo ===============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing Python dependencies...
cd phishing-detector
if not exist "requirements.txt" (
    echo ERROR: requirements.txt not found
    cd ..
    pause
    exit /b 1
)
pip install -r requirements.txt --quiet
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo      Python dependencies installed successfully
echo.

echo [2/4] Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo      Node.js dependencies installed successfully
echo.

echo [3/4] Starting Phishing Detection Service (Python)...
start "Phishing Detector" cmd /k "cd phishing-detector && python phishing_detector.py"
timeout /t 3 /nobreak >nul
echo      Phishing Detection Service started on http://localhost:5000
echo.

echo [4/4] Starting Mail Server (Node.js)...
start "Mail Server" cmd /k "node server.js"
timeout /t 2 /nobreak >nul
echo      Mail Server started on http://localhost:3001
echo.

echo ===============================================
echo  All services started successfully!
echo ===============================================
echo.
echo  Mail Server:         http://localhost:3001
echo  Phishing Detector:   http://localhost:5000
echo.
echo  Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
taskkill /FI "WindowTitle eq Phishing Detector*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq Mail Server*" /T /F >nul 2>&1
echo Services stopped.
