# MongoDB Docker Commands

## 1. Simple MongoDB Container
```bash
# MongoDB containerini ishga tushirish
docker run --name ssmail-mongodb -p 27017:27017 -d mongo:latest

# Container holati
docker ps

# Container loglarini ko'rish
docker logs ssmail-mongodb
```

## 2. MongoDB with Authentication
```bash
# Authentication bilan MongoDB
docker run --name ssmail-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=ssmail_db \
  -d mongo:latest

# Connection string:
# mongodb://admin:password123@localhost:27017/ssmail_db?authSource=admin
```

## 3. MongoDB with Data Persistence
```bash
# Volume bilan ma'lumotlarni saqlash
docker run --name ssmail-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -d mongo:latest
```

## 4. MongoDB + Mongo Express (Web GUI)
```bash
# MongoDB
docker run --name ssmail-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -d mongo:latest

# Mongo Express (Web GUI)
docker run --name mongo-express \
  -p 8081:8081 \
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
  -e ME_CONFIG_MONGODB_ADMINPASSWORD=password123 \
  -e ME_CONFIG_MONGODB_URL=mongodb://admin:password123@ssmail-mongodb:27017/ \
  --link ssmail-mongodb:mongo \
  -d mongo-express:latest
```

## 5. Container Management Commands
```bash
# Container ni to'xtatish
docker stop ssmail-mongodb

# Container ni o'chirish
docker rm ssmail-mongodb

# Container ni qayta ishga tushirish
docker restart ssmail-mongodb

# Containerlarga kirish
docker exec -it ssmail-mongodb mongosh
```

## 6. Agar Docker ishlamasa:
1. Docker Desktop ni qayta ishga tushiring
2. Windows Services da Docker Desktop Service ni tekshiring
3. CMD dan ham sinab ko'ring: `cmd` → `docker --version`