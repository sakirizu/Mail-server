# 🚀 Smail - クイックスタートガイド

このガイドでは、Smailメールクライアントを最速で起動する方法を説明します。

## ⚡ 5分で起動

### 1. 依存関係のインストール

```bash
# ルートディレクトリで実行
npm install

# バックエンドの依存関係もインストール
cd backend
npm install
cd ..
```

### 2. サーバーの起動

**2つのターミナルを開いてください**

#### ターミナル1: バックエンド

```bash
npm run backend
```

✅ `Server running on port 3001` と表示されればOK

#### ターミナル2: フロントエンド

```bash
npm run dev
```

✅ `Ready started server on 0.0.0.0:3000` と表示されればOK

### 3. ブラウザでアクセス

ブラウザで以下のURLを開きます：

```
http://localhost:3000
```

### 4. ログイン

デモアカウントでログインできます：

- **メールアドレス**: `demo@example.com`
- **パスワード**: `password`

## 🎉 完了！

これでSmailメールクライアントが使用できます！

---

## 💡 トラブルシューティング

### ポートが既に使用されている

**エラー**: `Error: listen EADDRINUSE: address already in use :::3000`

**解決方法**:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID番号> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### MongoDBが起動していない

**エラー**: `MongoNetworkError: connect ECONNREFUSED`

**解決方法**:
1. MongoDBをインストール: https://www.mongodb.com/try/download/community
2. MongoDBを起動:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

### 依存関係のエラー

**解決方法**:

```bash
# node_modulesを削除して再インストール
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install && cd ..
```

---

## 📚 詳細情報

詳細なドキュメントは [README.md](README.md) をご覧ください。

