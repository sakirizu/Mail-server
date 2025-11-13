# 📋 要件定義書 - Smail Email Client

> **最終更新日**: 2025/11/13 13:55
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

### 2025-11-13 13:55:36 +0900

#### その他: 実装 dark mode と 改善 UI layout と shadows instead の borders (Implement dark mode and improve UI layout with shadows instead of borders)

- **作成者**: twichill
- **コミット**: `7a59fff`
- **変更ファイル**:
  - ✏️ `REQUIREMENTS.md`
  - ✏️ `app/(authenticated)/compose/page.tsx`
  - ✏️ `app/(authenticated)/drafts/page.tsx`
  - ✏️ `app/(authenticated)/inbox/page.tsx`
  - ✏️ `app/(authenticated)/layout.tsx`
  - ✏️ `app/(authenticated)/sent/page.tsx`
  - ✏️ `app/(authenticated)/spam/page.tsx`
  - ✏️ `app/(authenticated)/statistics/page.tsx`
  - ✏️ `app/globals.css`
  - ✏️ `components/MailItem.tsx`
  - ...他4ファイル



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

- **twichill**

---

## 📌 注意事項

- この要件定義書は `npm run update-requirements` コマンドで自動更新されます
- 手動で編集する場合は、変更履歴セクションを適切に更新してください
- Gitで管理されているため、チーム全体で共有・更新できます

