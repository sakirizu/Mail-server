import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useWindowDimensions, ScrollView, Modal, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import NotificationModal from '../components/NotificationModal';
import { API_ENDPOINTS } from '../config/api';

export default function LoginScreen({ navigation }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  
  // 2FA Setup states
  const [showTwoFASetup, setShowTwoFASetup] = useState(false);
  const [twoFAData, setTwoFAData] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handleLogin = async () => {
    if (!username || !password) {
      setNotificationData({
        type: 'error',
        title: 'エラー',
        message: 'ユーザー名とパスワードを入力してください'
      });
      setShowNotification(true);
      return;
    }
    
    // Demo account - frontend only login
    if (username === 'demo' && password === 'demo123') {
      setLoading(true);
      
      // Simulate loading delay
      setTimeout(() => {
        const demoUser = {
          id: 'demo-user',
          username: 'demo',
          name: 'Demo User',
          email: 'demo@ssmail.com',
          token: 'demo-token-12345'
        };
        
        login(demoUser);
        setNotificationData({
          type: 'success',
          title: '成功',
          message: 'デモユーザーとしてログインしました'
        });
        setShowNotification(true);
        setLoading(false);
      }, 1000);
      
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        setNotificationData({
          type: 'error',
          title: 'ログインエラー',
          message: errorData?.error || 'ユーザー名またはパスワードが正しくありません'
        });
        setShowNotification(true);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      if (data.requires2FA) {
        navigation.navigate('TwoFactorVerify', {
          tempToken: data.tempToken,
          availableMethods: data.availableMethods
        });
      } else if (data.token && data.user) {
        const userWithToken = { ...data.user, token: data.token };
        
        // Stay logged in logic - save token instead of password
        if (stayLoggedIn) {
          await AsyncStorage.setItem('stayLoggedIn', 'true');
          await AsyncStorage.setItem('savedUserToken', data.token);
          await AsyncStorage.setItem('savedUser', JSON.stringify(data.user));
        } else {
          await AsyncStorage.removeItem('stayLoggedIn');
          await AsyncStorage.removeItem('savedUserToken');
          await AsyncStorage.removeItem('savedUser');
          await AsyncStorage.removeItem('userCredentials'); // Remove old credentials
        }
        
        login(userWithToken);
        setNotificationData({
          type: 'success',
          title: 'ログイン成功',
          message: 'アカウントに正常にログインしました'
        });
        setShowNotification(true);
      } else {
        setNotificationData({
          type: 'error',
          title: 'エラー',
          message: data?.error || 'ログインに失敗しました'
        });
        setShowNotification(true);
      }
    } catch (e) {
      setNotificationData({
        type: 'error',
        title: '接続エラー',
        message: 'サーバーとの接続に失敗しました。サーバーが起動していることを確認してください。'
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !username || !password) {
      Alert.alert('Xatolik', 'Barcha maydonlarni to\'ldiring');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Xatolik', 'Parollar mos kelmaydi');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Xatolik', 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    const valid = /^[a-zA-Z0-9_]+$/.test(username);
    if (!valid) {
      Alert.alert('Xatolik', 'Username faqat harflar, raqamlar va _ bo\'lishi mumkin');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Show 2FA setup modal
        setTwoFAData(data);
        setShowTwoFASetup(true);
        Alert.alert('Hisob yaratildi!', 'Endi 2FA ni sozlang. QR kodni Google Authenticator yoki Authy ilovasida skanerlang.');
      } else {
        Alert.alert('Xatolik', data?.error || 'Hisob yaratishda xatolik');
      }
    } catch (e) {
      Alert.alert('Xatolik', 'Server xatoligi');
    } finally {
      setLoading(false);
    }
  };

  const confirmTwoFA = async () => {
    if (!totpCode || totpCode.length !== 6) {
      Alert.alert('Xatolik', '6 raqamli TOTP kodni kiriting');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/signup/confirm-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: twoFAData.userId, 
          totpCode: totpCode 
        })
      });
      const data = await res.json();
      
      if (data.success && data.token && data.user) {
        // Login the user automatically
        const userWithToken = { ...data.user, token: data.token };
        login(userWithToken);
        Alert.alert('Muvaffaqiyat!', '2FA sozlandi va hisobingizga kirdingiz!');
        
        // Reset everything
        setShowTwoFASetup(false);
        setTwoFAData(null);
        setTotpCode('');
        resetForm();
      } else {
        Alert.alert('Xatolik', data?.error || 'TOTP kod noto\'g\'ri');
        setTotpCode('');
      }
    } catch (e) {
      Alert.alert('Xatolik', 'Server xatoligi');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    resetForm();
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, isMobile && styles.containerMobile]}>
      <View style={[styles.formContainer, isMobile && styles.formContainerMobile]}>
        {/* Logo/Title */}
        <View style={styles.headerContainer}>
          <Text style={[styles.appTitle, isMobile && styles.appTitleMobile]}>SMAIL</Text>
          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            {isSignup ? '新規アカウント作成' : 'アカウントにログイン'}
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formFields}>
          {isSignup && (
            <TextInput
              style={[styles.input, isMobile && styles.inputMobile]}
              placeholder="お名前"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor={colors.placeholder}
            />
          )}
          
          <TextInput
            style={[styles.input, isMobile && styles.inputMobile]}
            placeholder="ユーザー名またはメールアドレス"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor={colors.placeholder}
          />
          
          <TextInput
            style={[styles.input, isMobile && styles.inputMobile]}
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.placeholder}
          />
          
          {!isSignup && (
            <View style={styles.checkboxContainer}>
              <TouchableOpacity 
                style={styles.checkbox}
                onPress={() => setStayLoggedIn(!stayLoggedIn)}
              >
                <View style={[styles.checkboxBox, stayLoggedIn && styles.checkboxChecked]}>
                  {stayLoggedIn && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>ログイン状態を保持</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {isSignup && (
            <TextInput
              style={[styles.input, isMobile && styles.inputMobile]}
              placeholder="パスワード確認"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor={colors.placeholder}
            />
          )}
        </View>

        {/* Main Action Button */}
        <TouchableOpacity 
          style={[styles.mainButton, isMobile && styles.mainButtonMobile, loading && styles.buttonDisabled]} 
          onPress={isSignup ? handleSignup : handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={[styles.mainButtonText, isMobile && styles.mainButtonTextMobile]}>
            {loading ? '処理中...' : isSignup ? 'アカウント作成' : 'ログイン'}
          </Text>
        </TouchableOpacity>

        {/* Toggle Mode */}
        <View style={styles.toggleContainer}>
          <Text style={[styles.toggleText, isMobile && styles.toggleTextMobile]}>
            {isSignup ? 'アカウントをお持ちですか？' : 'アカウントをお持ちでない方'}
          </Text>
          <TouchableOpacity 
            onPress={toggleMode}
            style={styles.toggleButton}
            activeOpacity={0.6}
          >
            <Text style={[styles.toggleButtonText, isMobile && styles.toggleButtonTextMobile]}>
              {isSignup ? 'ログイン' : 'アカウント作成'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* 2FA Setup Modal */}
      <Modal
        visible={showTwoFASetup}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>2FA Sozlash</Text>
            
            <Text style={styles.modalDescription}>
              Hisobingiz xavfsizligi uchun 2FA majburiy. QR kodni Google Authenticator yoki Authy da skanerlang:
            </Text>
            
            {/* Main Content Container */}
            <View style={styles.mainContentContainer}>
              {/* QR Code Section */}
              {twoFAData?.twoFASetup?.qrCode && (
                <View style={styles.qrCodeSection}>
                  <Text style={styles.sectionTitle}>📱 QR Kod</Text>
                  <View style={styles.qrCodeContainer}>
                    <Image 
                      source={{ uri: twoFAData.twoFASetup.qrCode }} 
                      style={styles.qrCodeImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.qrInstruction}>
                    Google Authenticator yoki Authy ilovasida skanerlang
                  </Text>
                </View>
              )}
              
              {/* Backup Codes Section */}
              {twoFAData?.twoFASetup?.backupCodes && (
                <View style={styles.backupCodesSection}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Ionicons name="lock-closed" size={20} color={colors.primary} style={{ marginRight: 8 }} />
                    <Text style={styles.sectionTitle}>Backup Kodlar</Text>
                  </View>
                  <Text style={styles.backupCodesWarning}>
                    ⚠️ Bu kodlarni xavfsiz saqlang! Telefon yo'qolsa kerak bo'ladi
                  </Text>
                  <View style={styles.backupCodesContainer}>
                    <View style={styles.backupCodesList}>
                      {twoFAData.twoFASetup.backupCodes.map((code, index) => (
                        <View key={index} style={styles.backupCodeItem}>
                          <Text style={styles.backupCode}>{code}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
            
            {/* Manual Entry Section */}
            <View style={styles.manualEntrySection}>
              <Text style={styles.secretKeyLabel}>Yoki qo'lda kod kiriting:</Text>
              <Text style={styles.secretKey}>
                {twoFAData?.twoFASetup?.secret}
              </Text>
            </View>
            
            {/* TOTP Input Section */}
            <View style={styles.totpSection}>
              <Text style={styles.totpLabel}>
                Ilovaldan 6 raqamli kodni kiriting:
              </Text>
              <TextInput
                style={styles.totpInput}
                placeholder="123456"
                value={totpCode}
                onChangeText={setTotpCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor={colors.placeholder}
              />
              
              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.buttonDisabled]}
                onPress={confirmTwoFA}
                disabled={loading || totpCode.length !== 6}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash va Kirish'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {twoFAData?.twoFASetup?.backupCodes && (
              <View style={styles.backupCodesContainer}>
                <Text style={styles.backupCodesTitle}>
                  ⚠️ Backup Kodlar (Muhim!)
                </Text>
                <Text style={styles.backupCodesWarning}>
                  Bu kodlarni xavfsiz joyda saqlang! Telefoningizni yo'qotgan holda kirishda kerak bo'ladi:
                </Text>
                <View style={styles.backupCodesList}>
                  {twoFAData.twoFASetup.backupCodes.map((code, index) => (
                    <Text key={index} style={styles.backupCode}>
                      {code}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Notification Modal */}
      <NotificationModal
        visible={showNotification}
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
        onClose={() => setShowNotification(false)}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
    minHeight: '100%',
  },
  containerMobile: {
    padding: 16,
  },
  formContainer: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  formContainerMobile: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  
  // Header Styles
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: 2,
  },
  appTitleMobile: {
    fontSize: 42,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.placeholder,
    textAlign: 'center',
  },
  subtitleMobile: {
    fontSize: 18,
  },

  // Form Styles
  formFields: {
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputMobile: {
    height: 52,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 18,
    fontSize: 16,
    borderWidth: 1.5,
    backgroundColor: colors.background,
  },

  // Button Styles
  mainButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  mainButtonMobile: {
    paddingVertical: 16,
    borderRadius: 10,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mainButtonTextMobile: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Toggle Styles
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  toggleText: {
    fontSize: 14,
    color: colors.placeholder,
    marginRight: 4,
  },
  toggleTextMobile: {
    fontSize: 16,
    marginRight: 6,
  },
  toggleButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButtonTextMobile: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    maxHeight: '90%',
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  qrCodeImage: {
    width: 180,
    height: 180,
    borderRadius: 10,
  },
  
  // Main container for QR and backup codes
  mainContentContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  
  // QR Code Section
  qrCodeSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  
  qrCodeContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
  },
  
  qrInstruction: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Backup Codes Section
  backupCodesSection: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  
  backupCodesWarning: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  
  backupCodesContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  
  backupCodesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  backupCodeItem: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  
  backupCode: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Manual Entry Section
  manualEntrySection: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  
  // TOTP Section
  totpSection: {
    alignItems: 'center',
  },
  secretKeyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  secretKey: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totpLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  totpInput: {
    height: 48,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: colors.background,
    color: colors.text,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backupCodesContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  backupCodesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
    textAlign: 'center',
  },
  backupCodesWarning: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  backupCodesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  backupCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#856404',
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
    width: '48%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },

  // Checkbox Styles
  checkboxContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '400',
  },
});
