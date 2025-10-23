@echo off
echo Starting MongoDB and MailHog services...

echo.
echo Starting MongoDB...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db"

timeout /t 3

echo.
echo Starting MailHog (if Docker is available)...
docker run -d --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog 2>nul
if %errorlevel% neq 0 (
    echo Docker not available or MailHog already running
    echo Please start MailHog manually or use Docker Desktop
)

echo.
echo Services starting...
echo MongoDB: mongodb://localhost:27017
echo MailHog Web UI: http://localhost:8025
echo MailHog SMTP: localhost:1025
echo.
echo Press any key to continue...
pause