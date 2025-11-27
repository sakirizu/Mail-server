@echo off
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo Starting Phishing Detection Service...
python phishing_detector.py
