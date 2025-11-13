# 📋 要件定義書 - Smail Email Client

> **最終更新日**: 2025/11/13 12:13
> **プロジェクト名**: Smail - Modern Email Client  
> **バージョン**: 1.0.0

---

## 📖 プロジェクト概要

Next.js + TypeScript + Tailwind CSSで構築されたモダンなメールクライアントアプリケーション。  
JWT認証とハイブリッドストレージ（MongoDB + ファイルシステム）を採用したセキュアなメール管理システム。

---

## 🎯 主な機能

### 認証機能
- ✅ ログイン/ログアウト
- ✅ JWT トークンベースの認証
- ✅ 認証ガードによる保護されたルート
- ✅ デモアカウント（`demo@example.com` / `password`）

### メール管理機能
- ✅ **受信トレイ** - 受信メールの一覧表示、未読/既読管理
- ✅ **送信済み** - 送信したメールの履歴
- ✅ **下書き** - 作成途中のメールを保存
- ✅ **メール作成** - 新規メールの作成と送信
- ✅ **迷惑メール** - スパムフィルタで検出されたメール
- ✅ **統計** - メール送受信の統計情報を視覚化

### UI/UX機能
- ✅ 赤・黄色・白を基調とした独自のカラーパレット
- ✅ リッチで使いやすいモダンなデザイン
- ✅ Inter + Noto Sans JP フォントによる読みやすい表示
- ✅ スムーズなグラデーションとホバーエフェクト
- ✅ レスポンシブなサイドバーナビゲーション

---

## 🛠️ 技術スタック

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

---

## 📂 プロジェクト構造

```
Mail-server/
├── app/                          # Next.js App Router
│   ├── (authenticated)/          # 認証が必要なページ
│   │   ├── inbox/                # 受信トレイ
│   │   ├── sent/                 # 送信済み
│   │   ├── drafts/               # 下書き
│   │   ├── compose/              # メール作成
│   │   ├── spam/                 # 迷惑メール
│   │   ├── statistics/           # 統計
│   │   └── layout.tsx            # 認証済みレイアウト
│   ├── login/                    # ログインページ
│   └── layout.tsx                # ルートレイアウト
├── components/                   # Reactコンポーネント
│   ├── ui/                       # shadcn/uiコンポーネント
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
│   └── twoFactorAuth.js          # 二段階認証
└── scripts/                      # スクリプト
    └── update-requirements.js    # 要件定義書更新スクリプト
```

---

## 📝 変更履歴

### 2025-11-13 11:53:12 +0900

#### 機能追加: Add guide for updating project to latest version

- **作成者**: twichill
- **コミット**: `b199bf4`
- **変更ファイル**:
  - ➕ `HOW_TO_UPDATE.md`

### 2025-11-13 11:49:28 +0900

#### 機能追加: Add beginner-friendly Git/GitHub guides

- **作成者**: twichill
- **コミット**: `d63c776`
- **変更ファイル**:
  - ➕ `GITHUB_GUIDE_FOR_BEGINNERS.md`
  - ➕ `GIT_CHEAT_SHEET.md`

### 2025-11-13 11:44:46 +0900

#### その他: Migrate to Next.js with custom red/yellow design

- **作成者**: twichill
- **コミット**: `f32a7ca`
- **変更ファイル**:
  - ➕ `.eslintrc.json`
  - ✏️ `.gitignore`
  - 🗑️ `App.js`
  - ➕ `QUICK_START.md`
  - ✏️ `README.md`
  - 🗑️ `app.json`
  - ➕ `app/(authenticated)/compose/page.tsx`
  - ➕ `app/(authenticated)/drafts/page.tsx`
  - ➕ `app/(authenticated)/inbox/page.tsx`
  - ➕ `app/(authenticated)/layout.tsx`
  - ...他66ファイル

### 2025-11-06 11:54:58 +0900

#### その他: Hi everyone

- **作成者**: twichill
- **コミット**: `4230c5c`
- **変更ファイル**:
  - ➕ `src/hi.html`

### 2025-11-06 05:45:16 +0000

#### その他: hello

- **作成者**: g024c1518-bit
- **コミット**: `016d1e2`
- **変更ファイル**:
  - ➕ `src/hello.html`

### 2025-10-28 12:23:11 +0900

#### 削除・整理: Clean up: Remove unnecessary server and config files

- **作成者**: sakiri
- **コミット**: `0d5fef7`
- **変更ファイル**:
  - 🗑️ `ANDROID_UI_UX_SUMMARY.md`
  - 🗑️ `DELETE_ACCOUNT_FIXES.md`
  - 🗑️ `DEVICE_SECURITY_IMPROVEMENTS.md`
  - 🗑️ `DOCKER_MONGODB_COMMANDS.md`
  - 🗑️ `MAIL_SERVER_README.md`
  - 🗑️ `MONGODB_SETUP_README.md`
  - 🗑️ `NATIVEWIND_SETUP.md`
  - 🗑️ `backend/2FA_README.md`
  - 🗑️ `backend/2fa_schema.sql`
  - 🗑️ `backend/add-test-user.sql`
  - ...他19ファイル

### 2025-10-28 12:17:56 +0900

#### 削除・整理: Clean up: Remove unnecessary files

- **作成者**: sakiri
- **コミット**: `53f5b4b`
- **変更ファイル**:
  - 🗑️ `App-Anonymous.js`
  - 🗑️ `App_backup.js`
  - 🗑️ `backend/globalMailService.js`
  - 🗑️ `backend/mailService_backup.js`
  - 🗑️ `backend/mailService_mongodb.js`
  - 🗑️ `backend/mailService_new.js`
  - 🗑️ `backend/schema-Anonymous.sql`
  - 🗑️ `backend/server-Anonymous.js`
  - 🗑️ `backend/test-email.json`
  - 🗑️ `backend/test-mail.js`
  - ...他26ファイル

### 2025-10-23 14:27:14 +0900

#### その他: Initial commit: Mail server with beautiful Japanese UI

- **作成者**: sakiri
- **コミット**: `593d14a`
- **変更ファイル**:
  - ➕ `.gitignore`
  - ➕ `ANDROID_UI_UX_SUMMARY.md`
  - ➕ `App-Anonymous.js`
  - ➕ `App.js`
  - ➕ `App_backup.js`
  - ➕ `DELETE_ACCOUNT_FIXES.md`
  - ➕ `DEVICE_SECURITY_IMPROVEMENTS.md`
  - ➕ `DOCKER_MONGODB_COMMANDS.md`
  - ➕ `MAIL_SERVER_README.md`
  - ➕ `MONGODB_SETUP_README.md`
  - ...他111ファイル



---

## 🚀 次のステップ

### 最重要
- [x] 要件定義書の初回更新を実行 ✅

### 優先度：高
- [ ] 機能追加の検討
- [ ] パフォーマンス最適化

### 優先度：中
- [ ] テストコードの追加
- [ ] ドキュメントの充実

### 優先度：低
- [ ] UI/UXの改善
- [ ] アクセシビリティの向上

---

## 👥 開発メンバー

- **sakiri**
- **twichill**
- **g024c1518-bit**

---

## 📌 注意事項

- この要件定義書は `npm run update-requirements` コマンドで自動更新されます
- 手動で編集する場合は、変更履歴セクションを適切に更新してください
- Gitで管理されているため、チーム全体で共有・更新できます

