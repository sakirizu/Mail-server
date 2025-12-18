# 📧 SMAIL - Secure Mail System (Secured by AI)
### 🇯🇵 日本語要件定義書 / 🇺🇿 O'zbek tili Talabnomasi

> **Last Updated / Oxirgi yangilanish**: 2024-12-18
> **Version / Versiya**: 1.2.0
> **Progress / Progress**: 92.5% 🏁

---

## 📌 1. Project Overview / Loyiha haqida qisqacha

| 🇯🇵 項目 (JP) | 🇺🇿 Element (UZ) | 説明 / Tavsif |
| :--- | :--- | :--- |
| **Name** | **Nomi** | **SMAIL** (SSM Mail System) |
| **Concept** | **Konsepsiya** | 🔐 Security-Focused Modern Email App |
| **Key Tech** | **Texnologiyalar** | React Native, Node.js, MySQL, MongoDB, Python (AI) |

---

## 🛡️ 💎 NEW: AI Phishing Detector / AI Fishing detektori
**🇯🇵 12月18日実装：業界標準URLリスト（JPCERT/CC）と連携した強力な検知機能。**
**🇺🇿 18-dekabrda qo'shildi: Xalqaro JPCERT/CC URL bazasi bilan integratsiya qilingan kuchli fishingga qarshi tizim.**

### 🇯🇵 主な検知ロジック:
1.  **JPCERT/CC リアルタイム連携**: 9,200件以上の既知フィッシングサイトを即座にブロック。
2.  **類似URL検知 (Levenshtein)**: `amazon-co-jp.xyz` のような偽サイトを自動検知。
3.  **危険キーワード分析**: 「緊急」「口座が凍結」などの危険な日本語・英語を分析。
4.  **リスクスコアリング**: 0-100%で危険度を表示し、50%以上は自動的にSPAMフォルダへ。

### 🇺🇿 Asosiy deteksiya mantiqi:
1.  **JPCERT/CC Real-vaqt**: 9,200 tadan ortiq xavfli saytlarni darhol bloklaydi.
2.  **O'xshash URL (Levenshtein)**: `amazon-co-jp.xyz` kabi soxta saytlarni avtomatik topadi.
3.  **Xavfli so'zlar tahlili**: "Urgent", "Hisobingiz bloklandi" kabi so'zlarni tahlil qiladi (JP/EN).
4.  **Xavf darajasi (Score)**: 0-100% gacha xavf darajasini hisoblaydi, 50% dan oshsa avtomatik SPAMga tashlaydi.

---

## ✅ Feature status / Funktsiyalar holati

| 🇯🇵 機能 | 🇺🇿 Funktsiya | Status |
| :--- | :--- | :--- |
| **2FA Authentication** | **2FA Autentifikatsiya** | ✅ 100% (TOTP, WebAuthn) |
| **Mail Management** | **Email boshqaruvi** | ✅ 100% (Inbox, Sent, Spam) |
| **AI Phishing Check** | **AI Fishing tekshiruvi** | ✅ 🛰️ NEW (1.2.0) |
| **Statistics UI** | **Statistika UI** | ✅ 100% |
| **Uzbek/Japanese Support** | **O'zbek/Yapon tilini qo'llab-quvvatlash** | ✅ 🆕 Update |

---

## 🚀 Setup / O'rnatish tartibi

### 1. MongoDB (Local)
🇯🇵 コンテナを削除して、認証なしで新しく起動することをお勧めします。
🇺🇿 Konteynerni o'chirib, autentifikatsiyasiz yangidan ishga tushirish tavsiya etiladi.
```powershell
docker stop ssmail_mongodb
docker rm ssmail_mongodb
docker run -d --name smail_mongodb -p 27017:27017 mongo:latest
```

### 2. Backend (Node.js)
```powershell
cd backend
npm install
npm start
```

### 3. Phishing Detector (Python)
```powershell
cd backend/phishing-detector
.\start.bat
```

### 4. Frontend (Mobile)
```powershell
npm install
npm start
```

---

## 🛠️ API & DB Config (.env)
🇯🇵 **重要**: データベース名は `ssmail` に統一されました。
🇺🇿 **Muhim**: Ma'lumotlar bazasi nomi `ssmail` ga o'zgartirildi.

- **MySQL DB Name**: `ssmail`
- **MongoDB URL**: `mongodb://localhost:27017/ssmail`
- **Backend Port**: `3002`
- **AI Service Port**: `5000`

---

## 📝 Authors / Mualliflar
- **Sakir Izu** (@sakirizu)
- **Collaborator** (@kosei)

