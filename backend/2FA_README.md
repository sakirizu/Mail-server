# 2FA (Two-Factor Authentication) Implementation

Bu loyihada ikki bosqichli autentifikatsiya (2FA) qo'shildi. Ikkala TOTP va Hardware Security Key usullarini qo'llab-quvvatlaydi.

## Qo'shilgan Funksiyalar

### 1. TOTP (Time-based One-Time Password)
- **Google Authenticator** va **Authy** ilovalari bilan ishlaydi
- QR kod orqali oson sozlash
- 6 raqamli kodlar bilan tasdiqlash
- Manual kod kiritish imkoniyati

### 2. Hardware Security Keys (FIDO2/WebAuthn)
- **YubiKey** va boshqa FIDO2 kalitlarini qo'llab-quvvatlaydi
- Browserning WebAuthn API si orqali ishlaydi
- Bir nechta kalitlarni ro'yxatdan o'tkazish imkoniyati
- Kalit nomlarini belgilash va boshqarish

### 3. Backup Kodlar
- 10 ta bir martalik backup kod
- 2FA qurilmasi yo'qolganda foydalanish uchun
- Parol bilan himoyalangan yangilash

### 4. 2FA Boshqaruvi
- 2FA ni majburiy yoki ixtiyoriy qilish
- Har bir usulni alohida yoqish/o'chirish
- Kalit va kodlarni boshqarish

## O'rnatish

### 1. Kerakli paketlarni o'rnatish
```bash
npm install speakeasy qrcode @simplewebauthn/server @simplewebauthn/types
```

### 2. Ma'lumotlar bazasini yangilash
```sql
-- 2fa_schema.sql faylini ishga tushiring
mysql -u username -p database_name < 2fa_schema.sql
```

### 3. Server sozlamalari
`.env` faylida quyidagi sozlamalarni tekshiring:
```env
JWT_SECRET=your_jwt_secret_here
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
```

## Foydalanish

### Foydalanuvchi uchun

#### 2FA Sozlash:
1. Profile → 2FA Settings ga o'ting
2. TOTP yoki Hardware Key ni tanlang
3. Ko'rsatmalarga amal qiling
4. Backup kodlarni saqlang

#### Login:
1. Username va parol kiriting
2. Agar 2FA yoqilgan bo'lsa, tasdiqlash ekrani chiqadi
3. Mavjud usullardan birini tanlang:
   - **TOTP**: Ilova dan 6 raqamli kod
   - **Hardware Key**: Kalitni ulang va tugmasini bosing
   - **Backup Code**: 8 belgili backup kod

### Developer uchun

#### API Endpoints:

**2FA Status:**
```
GET /api/2fa/status
Authorization: Bearer <token>
```

**TOTP Setup:**
```
POST /api/2fa/totp/generate
POST /api/2fa/totp/enable
POST /api/2fa/totp/disable
```

**WebAuthn Setup:**
```
POST /api/2fa/webauthn/register/begin
POST /api/2fa/webauthn/register/complete
GET /api/2fa/webauthn/keys
DELETE /api/2fa/webauthn/keys/:keyId
```

**Login Flow:**
```
POST /api/auth/login
POST /api/auth/verify-2fa
```

## Xavfsizlik

### TOTP:
- 32 bayt secret kalitlar
- HMAC-SHA1 algoritmi
- 30 soniyalik vaqt oynasi
- ±2 vaqt qadam toleransiyasi (60 soniya)

### WebAuthn:
- FIDO2 standarti
- Public key kriptografiyasi
- Origin va RP ID tasdiqlash
- Counter replay himoyasi

### Backup Kodlar:
- bcrypt hash (10 rounds)
- Bir martalik foydalanish
- Parol bilan himoyalangan yaratish

## Screen Layout

### LoginScreen
- Login/Signup toggle
- 2FA redirect logikasi
- Uzbek tilida matnlar

### TwoFactorVerifyScreen
- Method selection (TOTP/WebAuthn/Backup)
- Real-time verification
- User-friendly interface

### TwoFactorAuthScreen
- Complete 2FA management
- QR code display
- Key management
- Settings control

## Browser Support

### WebAuthn Requirements:
- Chrome 67+
- Firefox 60+
- Safari 14+
- Edge 18+

### HTTPS Requirement:
WebAuthn production da HTTPS talab qiladi. Development da localhost ishlatish mumkin.

## Troubleshooting

### Common Issues:

1. **WebAuthn not working:**
   - HTTPS ishlatilayotganini tekshiring
   - Browser compatibility ni tekshiring
   - rpID va origin to'g'riligini tekshiring

2. **TOTP kod qabul qilinmaydi:**
   - Vaqt sync ni tekshiring
   - Secret key to'g'riligini tekshiring
   - Window tolerance ni oshiring

3. **Database errors:**
   - 2fa_schema.sql ishga tushirilganini tekshiring
   - Foreign key constraints ni tekshiring

## Security Best Practices

1. **Secret Storage:** TOTP secret kalitlar ma'lumotlar bazasida encrypted saqlanishi kerak
2. **Rate Limiting:** 2FA verification uchun rate limiting qo'shing
3. **Backup Codes:** Foydalanuvchini backup kodlarni saqlashga undang
4. **Session Management:** 2FA dan keyin session lar to'g'ri boshqarilishi kerak

## Future Enhancements

- SMS 2FA qo'shish
- Email 2FA qo'shish
- Admin panel orqali 2FA boshqaruv
- Audit log va monitoring
- Mobile app notifications

---

Savollar va muammolar uchun development team bilan bog'laning.