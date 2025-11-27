# SSMail Backend Startup Script
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " SSMail Backend with Phishing Detection" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "[1/4] Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "      $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "      ERROR: Python not found!" -ForegroundColor Red
    Write-Host "      Please install Python 3.8+ from https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}

# Check Node.js
Write-Host "[2/4] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "      $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "      ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "      Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "[3/4] Installing dependencies..." -ForegroundColor Yellow
Write-Host "      Installing Python packages..." -ForegroundColor Gray
Set-Location phishing-detector
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ERROR: Failed to install Python dependencies!" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "      Installing Node.js packages..." -ForegroundColor Gray
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ERROR: Failed to install Node.js dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "      Dependencies installed successfully" -ForegroundColor Green

# Start services
Write-Host "[4/4] Starting services..." -ForegroundColor Yellow

Write-Host "      Starting Phishing Detection Service..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\phishing-detector'; python phishing_detector.py" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "      Starting Mail Server..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node server.js" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host " All services started successfully!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Mail Server:         http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Phishing Detector:   http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services are running in separate windows." -ForegroundColor Yellow
Write-Host "Close those windows to stop the services." -ForegroundColor Yellow
Write-Host ""
