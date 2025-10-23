# 📧 Mail Server - Japanese UI

Beautiful mail application with Japanese interface, modern design, and elegant 80% compose modal with blur effects and spring animations.

## ✨ Features

- 🇯🇵 **Full Japanese UI** - Complete Japanese language interface
- 📨 **Email Management** - Send, receive, and organize emails
- ✏️ **Beautiful Compose Modal** - 80% coverage modal with blur backdrop and smooth spring animations
- 📥 **Folder Management** - Inbox, Sent, Drafts, Trash, Spam
- 🎨 **Modern Blue Design** - iOS-style blue (#007AFF) theme with gradients
- 📱 **Responsive Layout** - Works on mobile and web
- 🔐 **Secure Authentication** - Login/Register with JWT tokens
- 💾 **Hybrid Storage** - MongoDB + File system storage

## 🎨 Design Highlights

### Compose Modal
- **80% Screen Coverage** - Centered with 15% margins (L/R) and 10% margins (T/B)
- **Beautiful Blue Header** - Gradient blue header matching iOS style
- **Glass Morphism** - White transparent backdrop (0.2 opacity) with 20px blur
- **Smooth Spring Animations** - Natural feel (tension: 80, friction: 6)
- **Borderless Inputs** - Clean shadow-based design with 16px border radius
- **Labels Above Inputs** - Better UX with 70% width inputs
- **Blue Send Button** - Gradient blue button (65% width) with shadow glow
- **Rounded Corners** - 24px border radius for premium feel

### UI Features
- No borders on inputs (borderWidth: 0)
- Smooth transitions and animations
- Japanese labels: 宛先 (To), 件名 (Subject), 本文 (Body)
- Clean white close button with icon
- Draft save button in header
- Professional typography and spacing

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote)
- npm or yarn

### Frontend Setup

```bash
# Install dependencies
npm install

# Start the app
npm start
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

The backend runs on `http://localhost:3001`

## 🛠️ Technologies

### Frontend
- React Native
- React Navigation 7.x
- Animated API (Spring animations)
- AsyncStorage
- Custom hooks (useAuth)
- Platform-specific styling (Web blur effects)

### Backend
- Node.js
- Express
- MongoDB/Mongoose
- JWT Authentication
- Bcrypt
- Hybrid Mail Service (MongoDB + File system)

## 📱 Screens

1. **Login Screen** (ログイン画面) - User authentication
2. **Register Screen** (登録画面) - New user registration
3. **Inbox** (受信トレイ) - Received emails
4. **Sent** (送信済み) - Sent emails
5. **Drafts** (下書き) - Draft emails
6. **Compose Modal** (新しいメッセージ) - Beautiful 80% modal
7. **Mail Detail** (メール詳細) - Email details view
8. **Trash** (ゴミ箱) - Deleted emails
9. **Spam** (迷惑メール) - Spam folder

## 🎯 API Endpoints

```
POST   /api/auth/login          - User login
POST   /api/auth/register       - User registration
GET    /api/mails/:folder       - Get mails by folder
GET    /api/mails/detail/:id    - Get mail details
POST   /api/mails/send          - Send new mail
POST   /api/mails/draft         - Save draft
DELETE /api/mails/:id           - Delete mail
PUT    /api/mails/:id/read      - Mark as read
```

## 🎨 Compose Modal Features

```javascript
// Beautiful animations
- Slide-up animation: translateY from screenHeight to 0
- Scale animation: from 0.9 to 1.0
- Backdrop fade: opacity from 0 to 1
- Spring physics: tension 80, friction 6
- Duration: 250ms for smooth feel

// Styling details
- Modal size: 80% coverage (70% width, 80% height)
- Border radius: 24px for all corners
- Header: Blue gradient (#007AFF to #0056D3)
- Backdrop: rgba(255,255,255,0.2) with 20px blur
- Inputs: 70% width, 16px radius, no borders
- Send button: 65% width, 25px radius, blue gradient
- Shadows: Multiple layers for depth
```

## 🔧 Configuration

Create a `.env` file in the backend directory:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/maildb
JWT_SECRET=your-secret-key-here
```

## 📂 Project Structure

```
D/
├── src/
│   ├── components/
│   │   ├── ComposeModal.js    # 80% modal with blur effects
│   │   ├── Sidebar.js          # Navigation sidebar
│   │   └── ...
│   ├── screens/
│   │   ├── InboxScreen.js
│   │   ├── MailDetailScreen.js
│   │   ├── LoginScreen.js
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.js      # Authentication context
│   └── styles/
│       └── theme.js            # Color theme
├── backend/
│   ├── server.js               # Express server
│   ├── hybridMailService.js    # Hybrid mail service
│   ├── mongoMailService.js     # MongoDB service
│   └── mailService.js          # File system service
├── App.js                      # Main app component
├── package.json
└── README.md
```

## 👨‍💻 Author

**Sakir Izu**
- GitHub: [@sakirizu](https://github.com/sakirizu)
- Repository: [Mail-server](https://github.com/sakirizu/Mail-server)

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Beautiful Japanese UI design with full Japanese language support
- Modern glass morphism and blur effects (backdrop-filter)
- Smooth spring animations with natural physics
- iOS-style blue theme (#007AFF) with gradients
- Clean, borderless input design with shadows
- 80% modal coverage for better user experience
- Platform-specific optimizations (web blur, native shadows)

## 🐛 Known Issues

None at the moment. Feel free to report any issues on GitHub!

## 🔮 Future Enhancements

- [ ] File attachments support
- [ ] Rich text editor for email body
- [ ] Email templates
- [ ] Dark mode support
- [ ] Push notifications
- [ ] Advanced search functionality
- [ ] Contact management
- [ ] Email signatures
- [ ] Multiple account support

## 📸 Screenshots

### Compose Modal
- Beautiful 80% modal with blue gradient header
- Glass morphism backdrop with blur effect
- Clean inputs with labels above
- iOS-style blue send button

### Features
- Full Japanese interface
- Smooth spring animations
- Modern design with rounded corners
- Professional shadows and depth
