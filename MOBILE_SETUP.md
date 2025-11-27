# Telefonda Test Qilish (Mobile Device Setup)

## 1. Kompyuter IP Manzilini Topish

Windows PowerShell'da:
```powershell
ipconfig
```

Sizning asosiy IP: **192.168.194.53**

## 2. Config Faylni Tekshirish

`src/config/api.js` faylida IP manzil to'g'ri kiritilganini tekshiring:
```javascript
const LOCAL_IP = '192.168.194.53';
```

## 3. Backend Serverni Ishga Tushirish

```bash
cd backend
node server.js
```

Server **http://192.168.194.53:3001** da ochiladi

## 4. Firewall Sozlamalari

Windows Firewall'da 3001 portini ochish:

1. **Windows Defender Firewall** ni oching
2. **Advanced settings** → **Inbound Rules** → **New Rule**
3. **Port** → **TCP** → **Specific local ports: 3001**
4. **Allow the connection**
5. **Domain, Private, Public** - hammasini belgilang
6. Nom: "Node.js Backend 3001"

## 5. Telefon va Kompyuter Bir Network'da Bo'lishi Kerak

- Telefon va kompyuter bir Wi-Fi'ga ulangan bo'lishi shart
- Expo app'ni ishga tushiring: `npx expo start`
- Telefonda Expo Go app orqali QR kodni skanerlang

## 6. Test Qilish

1. Backend server ishlayotganini tekshiring: **http://192.168.194.53:3001**
2. Telefonda app'ni oching
3. Login sahifasiga o'ting
4. Agar "接続エラー" (Connection Error) ko'rsatilsa:
   - Backend server ishlab turganini tekshiring
   - Firewall 3001 portini ochganini tekshiring
   - Telefon va kompyuter bir Wi-Fi'da ekanini tekshiring

## Troubleshooting

**Agar ulanmasa:**

```bash
# Backend serverda loglarni ko'ring:
node server.js

# Telefonda browserdan test qiling:
http://192.168.194.53:3001/api/auth/verify
```

**Agar 401 Unauthorized ko'rsatilsa** - Bu normal! Server ishlayapti, faqat token yo'q.
**Agar sahifa ochilmasa** - Firewall yoki network muammosi bor.
