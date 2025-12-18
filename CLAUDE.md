# SMAIL Technical Guide / Texnik qo'llanma (AI & Devs)

> **Last Update**: 2024-12-18
> **Version**: 1.2.0

---

## 🏗 System Architecture / Tizim arxitekturasi

1. **Frontend (React Native)**: Port 8081 (Expo)
   - UI logic for 2FA, Email list, and AI Alerts.
2. **Backend (Express.js)**: Port 3002
   - Central logic. Communicates with MySQL, MongoDB, and Python AI.
3. **Phishing Service (Python/Flask)**: Port 5000
   - Uses `scikit-learn` (conceptually) and logic-based scoring with JPCERT/CC URL lists.

---

## 🔍 NEW: 1.2.0 Technical Changes

### 🇯🇵 日本語の変更点:
- [x] 2FA認証のバグ修正（ポート3002への統一、DBスキーマ不整合の解消）
- [x] UIおよびメッセージの完全日本語化（2FA画面、エラーメッセージ含む）
- [x] 迷惑メール判定（AI Phishing Detector）との連携疎通確認
- [ ] 運用テスト・最終確認

### 🇺🇿 O'zbek tilidagi o'zgarishlar:
- **API Porti**: Barcha frontend so'rovlari `3001` dan `3002` ga o'zgartirildi.
- **Xatolik xabarlari**: UI va backend xatolik xabarlari yapon tiliga o'girildi (ウズベク語 dan Yaponchaga).
- **DB Nomlari**: Ma'lumotlar bazasi nomlari `ssmail` ga bir xillashtirildi.
- **Fishing tahlili**: Email yuborishda Python API avtomatik ravishda `checkPhishing` funksiyasi orqali ishga tushiriladi.

---

## 🛠 Database Config / Ma'lumotlar bazasi

### MySQL (User & Auth)
```sql
USE ssmail;
-- Table: users, user_totp, user_webauthn, user_backup_codes
```

### MongoDB (Emails)
- **Database**: `ssmail`
- **Collections**: `mails`, `drafts`, `attachments`

---

### サービスの起動順序
1. **MongoDB**: `docker start ssmail_mongodb` (コンテナ名に注意)
2. **AI Service**: `cd backend/phishing-detector` して `.\start.bat`
3. **Backend**: `cd backend` して `npm start`
4. **Frontend**: `npm start` (ルートディレクトリで実行)

### 2FA認証の修正詳細
- **ポート**: 全ての2FA関連APIを `3002` (バックエンド) に統合しました。
- **DB名**: MySQLのデータベースを `ssmail` に統一。
- **スキーマ**: `user_totp`, `user_2fa_settings` などのテーブルを再構築し、コードとカラム名を一致させました。

### 迷惑メール振り分けの注意点
AIサービス(`phishing-detector`)が停止している場合、全てのメールはデフォルトで「安全(inbox)」と判定されます。振り分けを機能させるには必ず `start.bat` を実行してください。

## 🚧 Development Rules / Qoidalar

- **🇯🇵 日本人とウズベキスタン人の共通言語として、コード内は英語。ドキュメントは両言語。**
- **🇺🇿 Yapon va O'zbek dasturchilari uchun umumiy til - Ingliz tili (kodda). Hujjatlarda esa ikkala til.**
- **Local Dev**: Use simple local MongoDB without hardcoded auth if possible.

---

## 📦 API Endpoints (New)

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/phishing/check` | Test current email risk |
| `GET` | `/api/phishing/status` | Check AI Service health |
