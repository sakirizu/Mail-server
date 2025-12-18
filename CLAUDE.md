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
- **APIポートの統一**: 全てのフロントエンド通信を `3001` から `3002` に変更。
- **エラーメッセージの日本語化**: ウズベク語/英語が混在していたUI・サーバーエラーを全て自然な日本語に修正。
- **DB名の統一**: MySQL/MongoDBともにデータベース名を `ssmail` に固定。
- **フィッシング検知ロジック**: `backend/server.js` の `checkPhishing` 関数内で、メール送信時に Python API を非同期で呼び出し。

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
