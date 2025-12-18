# 🛡️ SMAIL フィッシング検知サービス

## 概要

AIを活用したフィッシング検知サービスです。メールの安全性をリアルタイムで判定し、危険度スコアを算出します。

## 主な機能

| 機能 | 説明 |
|------|------|
| 🗄️ JPCERT/CC連携 | 日本向けフィッシングURLを日次取得 |
| 🌍 PhishTank連携 | 国際的なフィッシングURLデータベース |
| 🔍 類似URL検出 | 公式サイトに似せた偽URLを検出 |
| ⚠️ キーワード分析 | 危険なキーワードのパターン検出 |
| 📊 危険度スコア | 0-100%の総合危険度を算出 |

## 起動方法

### Windows
```bash
cd backend\phishing-detector
start.bat
```

### 手動起動
```bash
cd backend/phishing-detector
pip install -r requirements.txt
python phishing_detector.py
```

サービスは `http://localhost:5000` で起動します。

## API エンドポイント

### ヘルスチェック
```
GET /health
```

レスポンス:
```json
{
  "status": "ok",
  "jpcert_urls": 5000,
  "phishtank_urls": 120000,
  "last_update": "2025-12-18T12:00:00"
}
```

### メールチェック
```
POST /check-email
Content-Type: application/json

{
  "from": "sender@example.com",
  "subject": "【緊急】アカウント確認",
  "body": "こちらをクリック: https://amaz0n-jp.com/verify"
}
```

レスポンス:
```json
{
  "success": true,
  "is_phishing": true,
  "risk_score": 85,
  "risk_level": "🔴 危険",
  "risk_level_code": "danger",
  "reasons": [
    "「amazon.co.jp」に酷似した偽ドメインの可能性 (87.5%類似)",
    "危険キーワード検出: 緊急, 確認"
  ],
  "recommendation": "spam"
}
```

### URLチェック
```
POST /check-url
Content-Type: application/json

{
  "url": "https://amaz0n-secure.com/login"
}
```

### データ更新
```
POST /refresh-data
```

## 危険度スコアの判定基準

| スコア | レベル | 対応 |
|--------|--------|------|
| 0-29 | 🟢 安全 | 受信トレイへ |
| 30-49 | 🟡 注意 | 受信トレイへ（警告表示） |
| 50-69 | 🟠 警告 | 迷惑メールへ |
| 70-100 | 🔴 危険 | 迷惑メールへ |

## 検出ロジック

### 1. 既知フィッシングURL (最大+50点)
- JPCERT/CC データベースとの照合
- PhishTank データベースとの照合

### 2. 類似ドメイン検出 (最大+30点)
- Levenshtein距離による類似度計算
- 80%以上の類似度で警告
- タイポスクワッティングパターン検出

### 3. 危険キーワード (最大+30点)
- 「緊急」「アカウント停止」「パスワード確認」等
- 日本語・英語両対応

### 4. その他の指標
- IPアドレスのURL使用 (+15点)
- 怪しいTLD (.tk, .xyz等) (+10点)
- 送信者ドメイン偽装 (+20点)

## 監視対象の公式ドメイン

- 銀行: mufg.jp, smbc.co.jp, mizuhobank.co.jp 等
- EC: amazon.co.jp, rakuten.co.jp, yahoo.co.jp 等
- テック: apple.com, google.com, microsoft.com 等
- 通信: nttdocomo.co.jp, au.com, softbank.jp 等
- 配送: kuronekoyamato.co.jp, sagawa-exp.co.jp 等

## ファイル構成

```
phishing-detector/
├── phishing_detector.py     # メインサービス
├── requirements.txt          # Python依存関係
├── start.bat                 # Windows起動スクリプト
├── README.md                 # このファイル
├── jpcert_cache.json        # JPCERT/CCキャッシュ (自動生成)
└── phishtank_cache.json     # PhishTankキャッシュ (自動生成)
```

## トラブルシューティング

### エラー: モジュールが見つからない
```bash
pip install -r requirements.txt
```

### エラー: JPCERT/CCデータが取得できない
- インターネット接続を確認
- キャッシュファイルを削除して再起動

### パフォーマンスが遅い
- キャッシュファイルが古い場合は `/refresh-data` を実行
