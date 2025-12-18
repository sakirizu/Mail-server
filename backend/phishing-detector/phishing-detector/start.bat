@echo off
chcp 65001 >nul
echo ==========================================
echo SMAIL Phishing Detection Service
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/2] Installing dependencies...
pip install -r requirements.txt --quiet

echo [2/2] Starting service...
echo.
python phishing_detector.py
