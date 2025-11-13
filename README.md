# 📧 Smail - Modern Email Client

Next.js + TypeScript + Tailwind CSSで構築されたモダンなメールクライアントアプリケーション。

## ✨ 特徴

- 🎨 **独自のモダンUI** - 赤・黄色・白を基調としたリッチで使いやすいデザイン
- 📨 **完全なメール管理** - 受信トレイ、送信済み、下書き、作成、迷惑メール、統計
- 🔐 **セキュアな認証** - JWT トークンベースの認証システム
- 💾 **ハイブリッドストレージ** - MongoDB + ファイルシステム
- 📱 **レスポンシブデザイン** - モバイル・デスクトップ対応
- 🎯 **TypeScript** - 型安全性の確保
- ⚡ **Next.js 15** - 最新のApp Routerとパフォーマンス最適化
- 🌐 **多言語対応** - 日本語UIサポート

## 🚀 セットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn
- MongoDB（ローカルまたはリモート）

### 1. 依存関係のインストール

```bash
# フロントエンドの依存関係をインストール
npm install
```

### 2. バックエンドのセットアップ

```bash
# バックエンドディレクトリに移動
cd backend

# バックエンドの依存関係をインストール
npm install

# バックエンドディレクトリに戻る
cd ..
```

### 3. 環境変数の設定

`backend/.env` ファイルを作成して以下を設定：

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/maildb
JWT_SECRET=your-secret-key-here
```

## 🏃 実行方法

### 開発モードで起動

**ターミナル1: バックエンドサーバー**

```bash
npm run backend
```

バックエンドは `http://localhost:3001` で起動します。

**ターミナル2: フロントエンド（Next.js）**

```bash
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

### アクセス

ブラウザで `http://localhost:3000` を開いて、以下のデモアカウントでログインできます：

- **メールアドレス**: `demo@example.com`
- **パスワード**: `password`

### 本番ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start
```

## 📂 プロジェクト構造

```
Mail-server/
├── app/                          # Next.js App Router
│   ├── (authenticated)/          # 認証が必要なページ
│   │   ├── inbox/
│   │   │   └── page.tsx          # 受信トレイ
│   │   ├── sent/
│   │   │   └── page.tsx          # 送信済み
│   │   ├── drafts/
│   │   │   └── page.tsx          # 下書き
│   │   ├── compose/
│   │   │   └── page.tsx          # メール作成
│   │   ├── spam/
│   │   │   └── page.tsx          # 迷惑メール
│   │   ├── statistics/
│   │   │   └── page.tsx          # 統計
│   │   └── layout.tsx            # 認証済みレイアウト
│   ├── login/
│   │   └── page.tsx              # ログインページ
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # ホームページ（リダイレクト）
│   └── globals.css               # グローバルスタイル
├── components/                   # Reactコンポーネント
│   ├── ui/                       # shadcn/uiコンポーネント
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── TopBar.tsx                # トップバー
│   ├── Sidebar.tsx               # サイドバー
│   ├── MailItem.tsx              # メールアイテム
│   └── AuthGuard.tsx             # 認証ガード
├── lib/                          # ユーティリティ
│   └── utils.ts                  # 共通関数
├── backend/                      # バックエンドサーバー
│   ├── server.js                 # Expressサーバー
│   ├── hybridMailService.js      # ハイブリッドメールサービス
│   ├── mongoMailService.js       # MongoDBメールサービス
│   ├── twoFactorAuth.js          # 二段階認証
│   └── package.json              # バックエンドの依存関係
├── next.config.js                # Next.js設定
├── tailwind.config.ts            # Tailwind CSS設定
├── tsconfig.json                 # TypeScript設定
├── package.json                  # 依存関係
└── README.md                     # このファイル
```

## 🎯 主な機能

### 認証
- ログイン/ログアウト
- デモアカウント（メールアドレス: `demo@example.com`, パスワード: `password`）
- JWT トークンベースの認証
- 認証ガードによる保護されたルート

### メール機能
- **受信トレイ** - 受信メールの一覧表示、未読/既読管理
- **送信済み** - 送信したメールの履歴
- **下書き** - 作成途中のメールを保存
- **メール作成** - 新規メールの作成と送信
- **迷惑メール** - スパムフィルタで検出されたメール
- **統計** - メール送受信の統計情報を視覚化

### UI/UX
- 赤・黄色・白を基調とした独自のカラーパレット
- リッチで使いやすいモダンなデザイン
- Inter + Noto Sans JP フォントによる読みやすい表示
- スムーズなグラデーションとホバーエフェクト
- レスポンシブなサイドバーナビゲーション

## 🛠️ 使用技術

### フロントエンド
- **Next.js 15.5.3** - Reactフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - ユーティリティファーストCSS
- **shadcn/ui** - UIコンポーネントライブラリ
- **Radix UI** - アクセシブルなUIプリミティブ
- **Lucide React** - アイコンライブラリ
- **Axios** - HTTPクライアント

### バックエンド
- **Node.js** - サーバーランタイム
- **Express** - Webフレームワーク
- **MongoDB** - データベース
- **JWT** - 認証トークン
- **Bcrypt** - パスワードハッシュ化

## 📝 スクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# バックエンドサーバー起動
npm run backend

# リントチェック
npm run lint
```

## 🔧 設定

### Next.js設定 (`next.config.js`)
- APIリライト設定（`/api/*` → `http://localhost:3001/api/*`）
- 画像ドメイン設定

### Tailwind CSS設定 (`tailwind.config.ts`)
- 赤・黄色・白を基調としたカスタムカラーパレット
- カスタムシャドウとボーダー半径
- Inter + Noto Sans JP フォントファミリー
- グラデーション対応

## 🐛 トラブルシューティング

### バックエンドに接続できない
- バックエンドサーバーが起動しているか確認
- `http://localhost:3001` が利用可能か確認
- MongoDBが起動しているか確認

### 型エラーが発生する
```bash
# TypeScriptの型チェック
npx tsc --noEmit
```

### ビルドエラー
```bash
# キャッシュをクリアして再ビルド
rm -rf .next
npm run build
```

## 🚀 GitHub へのアップロード手順

### 1. Gitリポジトリの初期化（初回のみ）

```bash
# Gitリポジトリを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: Smail email client with Next.js"
```

### 2. GitHubにリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名を入力（例：`smail-email-client`）
4. 「Create repository」をクリック

### 3. リモートリポジトリを追加してプッシュ

```bash
# リモートリポジトリを追加（YOUR_USERNAMEとREPO_NAMEは実際の値に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# メインブランチにプッシュ
git branch -M main
git push -u origin main
```

### 4. 環境変数の管理

重要：`.env` ファイルは `.gitignore` に含まれているため、GitHubにはアップロードされません。
リポジトリには `.env.example` を作成して、必要な環境変数を記載しておくと良いでしょう。

```bash
# .env.exampleを作成
echo "PORT=3001
MONGODB_URI=mongodb://localhost:27017/maildb
JWT_SECRET=your-secret-key-here" > backend/.env.example

# .env.exampleをコミット
git add backend/.env.example
git commit -m "Add .env.example for configuration reference"
git push
```

## 📄 ライセンス

MIT License

## 👨‍💻 作成者

このプロジェクトは、モダンなメールクライアントのUIとバックエンド機能を実装したデモアプリケーションです。
