@echo off
echo 🚀 Starting MongoDB Docker Container...

REM Stop and remove existing container if exists
docker stop ssmail-mongodb 2>nul
docker rm ssmail-mongodb 2>nul

REM Start new MongoDB container
echo 📦 Creating MongoDB container...
docker run --name ssmail-mongodb ^
  -p 27017:27017 ^
  -e MONGO_INITDB_ROOT_USERNAME=admin ^
  -e MONGO_INITDB_ROOT_PASSWORD=password123 ^
  -e MONGO_INITDB_DATABASE=ssmail_db ^
  -d mongo:latest

if %errorlevel% == 0 (
    echo ✅ MongoDB container started successfully!
    echo 🔗 Connection: mongodb://admin:password123@localhost:27017/ssmail_db?authSource=admin
    echo 🚀 Starting Mongo Express (Web GUI)...
    
    REM Start Mongo Express
    docker stop mongo-express 2>nul
    docker rm mongo-express 2>nul
    
    timeout /t 5 /nobreak >nul
    
    docker run --name mongo-express ^
      -p 8081:8081 ^
      -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin ^
      -e ME_CONFIG_MONGODB_ADMINPASSWORD=password123 ^
      -e ME_CONFIG_MONGODB_URL=mongodb://admin:password123@host.docker.internal:27017/ ^
      -e ME_CONFIG_BASICAUTH_USERNAME=admin ^
      -e ME_CONFIG_BASICAUTH_PASSWORD=admin ^
      -d mongo-express:latest
    
    if %errorlevel% == 0 (
        echo ✅ Mongo Express started successfully!
        echo 🌐 Web GUI: http://localhost:8081 (admin/admin)
    ) else (
        echo ⚠️  Mongo Express failed to start, but MongoDB is running
    )
    
    echo.
    echo 🎉 MongoDB setup complete!
    echo 📊 Database: ssmail_db
    echo 🔑 Username: admin
    echo 🔑 Password: password123
) else (
    echo ❌ Failed to start MongoDB container
    echo 💡 Make sure Docker Desktop is running
)

pause