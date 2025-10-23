# SSMail - Secure Email System

## 🚀 Ishga Tushirish

### 1. MongoDB ni ishga tushirish

Windows:
```bash
start-mongodb.bat
```

Linux/Mac:
```bash
chmod +x start-mongodb.sh
./start-mongodb.sh
```

### 2. Backend Dependencies o'rnatish
```bash
cd backend
npm install
```

### 3. Environment o'rnatish
```bash
cd backend
copy .env.example .env
# .env faylini o'z ma'lumotlaringiz bilan to'ldiring
```

### 4. Backend serverni ishga tushirish
```bash
cd backend
npm start
```

### 5. Frontend ni ishga tushirish
```bash
npm start
```

## 📊 Database Architecture

### MySQL (User Data)
- **users** - foydalanuvchi ma'lumotlari
- **user_2fa_settings** - 2FA sozlamalari
- **totp_secrets** - TOTP maxfiy kalitlar
- **backup_codes** - 2FA backup kodlar
- **webauthn_credentials** - WebAuthn kredensiallar

### MongoDB (Mail Data)
- **mails** - email xabarlar
- **drafts** - qoralamalar
- **attachments** - biriktirmalar
- **mail_statistics** - statistika ma'lumotlari

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Yangi hisob yaratish
- `POST /api/auth/login` - Tizimga kirish
- `POST /api/auth/verify-2fa` - 2FA tasdiqlash

### Mail Operations (MongoDB)
- `GET /api/mails/:folder` - Papka bo'yicha xabarlar
- `GET /api/mail/:mailId` - Bitta xabar
- `POST /api/mail/send` - Xabar yuborish
- `POST /api/mail/draft` - Qoralama saqlash
- `PATCH /api/mail/:mailId` - Xabar yangilash
- `DELETE /api/mail/:mailId` - Xabar o'chirish
- `GET /api/mails/search/:query` - Xabarlarni qidirish
- `GET /api/mails/stats` - Email statistikasi

## 🐳 MongoDB Management

### Mongo Express (Database GUI)
- URL: http://localhost:8081
- Username: admin
- Password: admin123

### Direct MongoDB Connection
```
URL: mongodb://ssmail_admin:ssmail_password_2024@localhost:27017/ssmail_db
Database: ssmail_db
```

## 🧪 Test User

Username: `test`  
Password: `123456`  
Email: `test@ssm.com`

## 📁 Folder Structure

```
backend/
├── server.js              # Main server file
├── mongoMailService.js    # MongoDB mail operations
├── mailService.js         # SMTP mail service
├── twoFactorAuth.js       # 2FA implementation
└── package.json          # Dependencies

docker-compose-mongo.yml   # MongoDB Docker setup
mongo-init/
└── init-ssmail.js        # MongoDB initialization
```

## 🔧 Features

- ✅ User authentication (MySQL)
- ✅ Two-factor authentication (TOTP, WebAuthn, Backup codes)
- ✅ Email storage (MongoDB)
- ✅ Email send/receive
- ✅ Drafts management
- ✅ Email search
- ✅ Mail statistics
- ✅ Multiple account support
- ✅ Responsive design