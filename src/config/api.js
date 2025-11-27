import { Platform } from 'react-native';

// Kompyuteringizning local IP manzilini kiriting
// Windows: ipconfig (Wi-Fi yoki Ethernet adapter)
// Mac/Linux: ifconfig yoki ip addr
const LOCAL_IP = '192.168.194.53'; // Sizning Wi-Fi IP manzilingiz

// Platform.OS === 'web' bo'lsa localhost ishlatamiz
// Mobile (Android/iOS) uchun local IP ishlatamiz
export const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3002' 
  : `http://${LOCAL_IP}:3002`;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  VERIFY_2FA: `${API_BASE_URL}/api/auth/verify-2fa`,
  VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify`,
  
  // Mails
  MAILS: `${API_BASE_URL}/api/mails`,
  MAIL_SEND: `${API_BASE_URL}/api/mails/send`,
  MAIL_DRAFT: `${API_BASE_URL}/api/mails/draft`,
  
  // Profile
  PROFILE: `${API_BASE_URL}/api/profile`,
};

console.log('🌐 API Base URL:', API_BASE_URL);
