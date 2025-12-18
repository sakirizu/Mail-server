# SSMail - セキュアメールシステム

## 🚀 起動方法

### 1. MongoDB の起動

Windowsの場合:
```bash
start-mongodb.bat
```

Linux/Macの場合:
```bash
chmod +x start-mongodb.sh
./start-mongodb.sh
```

### 2. バックエンドの依存関係のインストール
```bash
cd backend
npm install
```

### 3. 環境設定
```bash
cd backend
copy .env.example .env
# .env ファイルを自分の情報に合わせて編集してください
```

### 4. バックエンドサーバーの起動
```bash
cd backend
npm start
```

### 5. フロントエンドの起動
```bash
npm start
```

## 📊 データベース設計

### MySQL (ユーザーデータ)
- **users** - ユーザー情報
- **user_2fa_settings** - 2FA（二段階認証）設定
- **totp_secrets** - TOTP 秘密鍵
- **backup_codes** - 2FA バックアップコード
- **webauthn_credentials** - WebAuthn 認証情報

### MongoDB (メールデータ)
- **mails** - メールメッセージ
- **drafts** - 下書き
- **attachments** - 添付ファイル
- **mail_statistics** - 統計データ

## 🔐 API エンドポイント

### 認証 (Authentication)
- `POST /api/auth/signup` - 新規アカウント作成
- `POST /api/auth/login` - ログイン
- `POST /api/auth/verify-2fa` - 2FA 認証

### メール操作 (MongoDB)
- `GET /api/mails/:folder` - フォルダごとのメッセージ取得
- `GET /api/mail/:mailId` - 特定のメッセージ取得
- `POST /api/mail/send` - メッセージ送信
- `POST /api/mail/draft` - 下書き保存
- `PATCH /api/mail/:mailId` - メッセージ更新
- `DELETE /api/mail/:mailId` - メッセージ削除
- `GET /api/mails/search/:query` - メッセージ検索
- `GET /api/mails/stats` - メール統計情報

## 🐳 MongoDB 管理

### Mongo Express (データベース管理 GUI)
- URL: http://localhost:8081
- ユーザー名: admin
- パスワード: admin123

### 直接 MongoDB に接続する場合
```
URL: mongodb://ssmail_admin:ssmail_password_2024@localhost:27017/ssmail_db
データベース: ssmail_db
```

## 🧪 テスト用ユーザー

ユーザー名: `test`  
パスワード: `123456`  
メールアドレス: `test@ssm.com`

## 📁 ディレクトリ構造

```
backend/
├── server.js              # メインサーバーファイル
├── mongoMailService.js    # MongoDB メール操作
├── mailService.js         # SMTP メールサービス
├── twoFactorAuth.js       # 2FA 実装
└── package.json          # 依存関係

docker-compose-mongo.yml   # MongoDB Docker 設定
mongo-init/
└── init-ssmail.js        # MongoDB 初期設定
```

## 🔧 機能一覧

- ✅ ユーザー認証 (MySQL)
- ✅ 二段階認証 (TOTP, WebAuthn, バックアップコード)
- ✅ メールストレージ (MongoDB)
- ✅ メールの送受信
- ✅ 下書き管理
- ✅ メール検索
- ✅ メール統計
- ✅ 複数アカウント対応
- ✅ レスポンシブデザイン
