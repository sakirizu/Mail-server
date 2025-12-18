# MongoDB Docker コマンド集

## 1. シンプルな MongoDB コンテナの起動
```bash
# MongoDB コンテナを起動
docker run --name ssmail-mongodb -p 27017:27017 -d mongo:latest

# コンテナの状態を確認
docker ps

# コンテナのログを表示
docker logs ssmail-mongodb
```

## 2. 認証付き MongoDB の起動
```bash
# 認証を有効にして MongoDB を起動
docker run --name ssmail-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=ssmail_db \
  -d mongo:latest

# 接続文字列:
# mongodb://admin:password123@localhost:27017/ssmail_db?authSource=admin
```

## 3. データの永続化（ボリューム使用）
```bash
# ボリュームを使用してデータを保存
docker run --name ssmail-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -d mongo:latest
```

## 4. MongoDB + Mongo Express (Web GUI)
```bash
# MongoDB の起動
docker run --name ssmail-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -d mongo:latest

# Mongo Express (Web 管理画面) の起動
docker run --name mongo-express \
  -p 8081:8081 \
  -e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
  -e ME_CONFIG_MONGODB_ADMINPASSWORD=password123 \
  -e ME_CONFIG_MONGODB_URL=mongodb://admin:password123@ssmail-mongodb:27017/ \
  --link ssmail-mongodb:mongo \
  -d mongo-express:latest
```

## 5. コンテナ管理コマンド
```bash
# コンテナの停止
docker stop ssmail-mongodb

# コンテナの削除
docker rm ssmail-mongodb

# コンテナの再起動
docker restart ssmail-mongodb

# コンテナ内部に入る (シェル実行)
docker exec -it ssmail-mongodb mongosh
```

## 6. Docker が動作しない場合：
1. Docker Desktop を再起動してください。
2. Windows サービスで「Docker Desktop Service」が実行中か確認してください。
3. コマンドプロンプト（CMD）からバージョン確認を試してください：`docker --version`
