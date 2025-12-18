# SSMail - セキュアでシンプルなメールシステム

## メールサーバーの機能

### 📧 完全なメール管理
- **メール送信**: 宛先(TO)、CC、BCCをサポートした完全なメール作成機能
- **メール受信**: リアルタイムの受信と保存
- **フォルダ管理**: 受信トレイ、送信済み、下書き、迷惑メールの整理
- **スレッド表示**: メールの会話形式表示のサポート
- **添付ファイル**: ファイル添付の処理（実装準備完了）

### 🛡️ セキュリティ機能
- **迷惑メール検出**: キーワード検出による自動迷惑メールフィルタリング
- **認証**: JWT（JSON Web Token）ベースのセキュアなアクセス
- **セッショントラッキング**: デバイスと場所の監視
- **開封確認**: メールの既読ステータスの追跡

### 🎯 高度な機能
- **リアルタイム統計**: メールの使用状況分析
- **検索とフィルタ**: 高度なメール検索機能
- **ラベル/タグ**: Gmailスタイルのラベリングシステム
- **自動アーカイブ**: メールの自動アーカイブ機能
- **一括操作**: メールの大量管理

## クイックスタート

### 1. データベースのセットアップ
```sql
-- SQLスキーマを実行
mysql -u root -p < backend/mailSchema.sql
```

### 2. 環境設定
```bash
# 環境変数をコピーして設定
cp .env.example .env
# .env を開き、データベースの認証情報を編集
```

### 3. サーバーの起動
```bash
# 全てのサーバー（認証 + メール）を起動
npm run start-all

# または個別に起動
npm run server        # 認証サーバー (ポート 4000)
npm run mail-server    # メールサーバー (ポート 5000)
```

### 4. API エンドポイント

#### メールサーバー (ポート 5000)
```
GET    /api/mail/inbox      - 受信トレイのメール取得
GET    /api/mail/sent       - 送信済みメールの取得
GET    /api/mail/drafts     - 下書きメールの取得
GET    /api/mail/spam       - 迷惑メールの取得
GET    /api/mail/:id        - 特定のメールを取得
POST   /api/mail/send       - 新規メール送信
POST   /api/mail/draft      - 下書き保存
DELETE /api/mail/:id        - メールの削除
PATCH  /api/mail/:id/star   - メールのスター付け/解除
PATCH  /api/mail/:id/read   - 既読/未読の切り替え
PATCH  /api/mail/:id/spam   - 迷惑メールフォルダへの移動/戻し
GET    /api/mail/stats      - 統計情報の取得
GET    /api/mail/health     - ヘルスチェック
```

## API 使用例

### メールの送信
```javascript
const emailData = {
  to: "recipient@example.com",
  subject: "Hello World",
  body: "これはテストメールです",
  cc: "cc@example.com",
  bcc: "bcc@example.com"
};

const response = await sendEmail(emailData);
```

### 統計情報の取得
```javascript
const stats = await fetchEmailStatistics();
console.log(stats.stats.totalReceived); // 合計受信数
console.log(stats.stats.spamDetected);  // 検出された迷惑メール数
```

## データベーススキーマ

### コアテーブル
- `emails` - メインのメール保存
- `email_attachments` - 添付ファイル
- `email_labels` - カスタムラベル/タグ
- `user_preferences` - ユーザー設定
- `spam_training` - 迷惑メール検出用データ

### セキュリティテーブル
- `user_sessions` - ログイン追跡
- `email_filters` - 自動フィルタールール

## 設定

### 迷惑メール検出
システムには基本的なキーワードベースの迷惑メール検出が含まれています。キーワードはメールサーバーのコード内でカスタマイズ可能です：

```javascript
const spamKeywords = ['spam', 'free money', 'click here', 'urgent', 'congratulations'];
```

### メール保存
- メールは MySQL データベースに保存されます
- 論理削除（削除フラグを立てるだけで、実際には削除されません）
- 全文検索サポート（実装準備完了）

## 開発

### 新機能の追加
1. `mailSchema.sql` のデータベーススキーマを更新
2. `mailServer.js` に API エンドポイントを追加
3. `mailService.js` にフロントエンドのサービス呼び出しを追加
4. 必要に応じて UI コンポーネントを更新

### テスト
```bash
# ヘルスチェック
curl http://localhost:5000/api/mail/health

# 統計情報の取得 (認証トークンが必要)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/mail/stats
```

## 本番環境へのデプロイ

### セキュリティ上の考慮事項
1. 本番環境では JWT_SECRET を変更すること
2. 全ての API 呼び出しに HTTPS を使用すること
3. レート制限（Rate Limiting）を実装すること
4. 入力値のバリデーションとサニタイズを追加すること
5. 機密データには環境変数を使用すること

### パフォーマンスの最適化
1. 大規模なデータセットに対してデータベースインデックスを追加すること
2. メールのページネーションを実装すること
3. セッション保存に Redis を使用すること
4. 添付ファイル用に CDN を追加すること

## 今後の改善案
- リアルな SMTP 統合
- メールテンプレート
- 高度な迷惑メール検出 (機械学習ベース)
- メールの暗号化
- モバイルプッシュ通知
- 送信予約機能
