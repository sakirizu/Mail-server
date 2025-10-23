@echo off
echo 🚀 Starting SSMail MongoDB services...

REM Start MongoDB services
docker-compose -f docker-compose-mongo.yml up -d

echo ⏳ Waiting for MongoDB to be ready...
timeout /t 10 /nobreak >nul

REM Check if MongoDB is running
docker ps | findstr "ssmail_mongodb" >nul
if %errorlevel% == 0 (
    echo ✅ MongoDB is running!
    echo 📊 Mongo Express (Database Admin^): http://localhost:8081
    echo    Username: admin
    echo    Password: admin123
    echo.
    echo 🔗 MongoDB Connection:
    echo    URL: mongodb://ssmail_admin:ssmail_password_2024@localhost:27017/ssmail_db
    echo    Database: ssmail_db
    echo.
    echo 📦 Installing MongoDB driver...
    cd backend && npm install mongodb
    echo.
    echo 🎉 MongoDB setup complete! You can now start your backend server.
) else (
    echo ❌ Failed to start MongoDB
    exit /b 1
)