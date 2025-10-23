import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function TwoFactorVerifyScreen({ route, navigation }) {
  const { tempToken, availableMethods } = route.params;
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [webauthnSession, setWebauthnSession] = useState(null);
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    // Auto-select first available method
    if (availableMethods.totp) {
      setSelectedMethod('totp');
    } else if (availableMethods.webauthn) {
      setSelectedMethod('webauthn');
      startWebAuthnAuth();
    } else if (availableMethods.backup) {
      setSelectedMethod('backup');
    }
  }, []);

  const startWebAuthnAuth = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/2fa/webauthn/auth/begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken })
      });
      
      const data = await response.json();
      if (data.error) {
        Alert.alert('Xatolik', data.error);
        return;
      }

      setWebauthnSession(data.sessionToken);
      
      // Start WebAuthn authentication
      if (navigator.credentials && navigator.credentials.get) {
        const credential = await navigator.credentials.get({
          publicKey: {
            ...data.options,
            challenge: new Uint8Array(data.options.challenge),
            allowCredentials: data.options.allowCredentials?.map(cred => ({
              ...cred,
              id: new Uint8Array(cred.id)
            }))
          }
        });

        // Verify with server
        await verifyWebAuthn(credential, data.sessionToken);
      } else {
        Alert.alert('Xatolik', 'WebAuthn brauzeringizda qo\'llab-quvvatlanmaydi');
      }
    } catch (error) {
      console.error('WebAuthn auth error:', error);
      Alert.alert('Xatolik', 'WebAuthn autentifikatsiyasida xatolik');
    } finally {
      setLoading(false);
    }
  };

  const verifyWebAuthn = async (credential, sessionToken) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          method: 'webauthn',
          sessionToken,
          webauthnResponse: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
              authenticatorData: Array.from(new Uint8Array(credential.response.authenticatorData)),
              signature: Array.from(new Uint8Array(credential.response.signature)),
              userHandle: credential.response.userHandle ? Array.from(new Uint8Array(credential.response.userHandle)) : null
            },
            type: credential.type
          }
        })
      });

      const data = await response.json();
      if (data.token && data.user) {
        const userWithToken = { ...data.user, token: data.token };
        login(userWithToken);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Xatolik', data.error || 'WebAuthn tasdiqlashda xatolik');
      }
    } catch (error) {
      Alert.alert('Xatolik', 'WebAuthn tasdiqlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!totpCode || totpCode.length !== 6) {
      Alert.alert('Xatolik', '6 raqamli TOTP kodni kiriting');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          method: 'totp',
          code: totpCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('2FA verification error:', errorData);
        Alert.alert('Xatolik', errorData?.error || `Server xatoligi: ${response.status}`);
        setTotpCode('');
        return;
      }

      const data = await response.json();
      if (data.token && data.user) {
        const userWithToken = { ...data.user, token: data.token };
        login(userWithToken);
        Alert.alert('Muvaffaqiyat!', 'Hisobingizga kirildi!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Xatolik', data.error || 'TOTP kod noto\'g\'ri');
        setTotpCode('');
      }
    } catch (error) {
      console.error('TOTP verification error:', error);
      Alert.alert('Xatolik', 'Server bilan bog\'lanishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const verifyBackupCode = async () => {
    if (!backupCode || backupCode.length !== 8) {
      Alert.alert('Xatolik', '8 raqamli backup kodni kiriting');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempToken,
          method: 'backup',
          code: backupCode
        })
      });

      const data = await response.json();
      if (data.token && data.user) {
        const userWithToken = { ...data.user, token: data.token };
        login(userWithToken);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Xatolik', data.error || 'Backup kod noto\'g\'ri yoki ishlatilgan');
        setBackupCode('');
      }
    } catch (error) {
      Alert.alert('Xatolik', 'Backup kod tasdiqlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={[styles.formContainer, isMobile && styles.formContainerMobile]}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, isMobile && styles.titleMobile]}>
            Ikki Bosqichli Tasdiqlash
          </Text>
          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            Hisobingizga kirish uchun 2FA ni tasdiqlang
          </Text>
        </View>

        {/* Method Selection */}
        <View style={styles.methodContainer}>
          {availableMethods.totp && (
            <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethod === 'totp' && styles.methodButtonActive
              ]}
              onPress={() => setSelectedMethod('totp')}
            >
              <Text style={[
                styles.methodText,
                selectedMethod === 'totp' && styles.methodTextActive
              ]}>
                🔐 Authenticator App
              </Text>
            </TouchableOpacity>
          )}

          {availableMethods.webauthn && (
            <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethod === 'webauthn' && styles.methodButtonActive
              ]}
              onPress={() => {
                setSelectedMethod('webauthn');
                startWebAuthnAuth();
              }}
            >
              <Text style={[
                styles.methodText,
                selectedMethod === 'webauthn' && styles.methodTextActive
              ]}>
                🔑 Security Key
              </Text>
            </TouchableOpacity>
          )}

          {availableMethods.backup && (
            <TouchableOpacity
              style={[
                styles.methodButton,
                selectedMethod === 'backup' && styles.methodButtonActive
              ]}
              onPress={() => setSelectedMethod('backup')}
            >
              <Text style={[
                styles.methodText,
                selectedMethod === 'backup' && styles.methodTextActive
              ]}>
                📋 Backup Code
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Input Section */}
        <View style={styles.inputContainer}>
          {selectedMethod === 'totp' && (
            <>
              <Text style={styles.inputLabel}>
                Google Authenticator yoki Authy dan 6 raqamli kodni kiriting:
              </Text>
              <TextInput
                style={[styles.codeInput, isMobile && styles.codeInputMobile]}
                placeholder="123456"
                value={totpCode}
                onChangeText={setTotpCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity
                style={[styles.verifyButton, loading && styles.buttonDisabled]}
                onPress={verifyTOTP}
                disabled={loading || totpCode.length !== 6}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {selectedMethod === 'webauthn' && (
            <View style={styles.webauthnContainer}>
              <Text style={styles.inputLabel}>
                Security key ni kompyuterga ulang va tugmasini bosing
              </Text>
              <View style={styles.webauthnStatus}>
                <Text style={styles.webauthnStatusText}>
                  {loading ? '🔄 Kutilmoqda...' : '🔑 Security key tayyor'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.verifyButton, loading && styles.buttonDisabled]}
                onPress={startWebAuthnAuth}
                disabled={loading}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? 'Kutilmoqda...' : 'Qayta urinish'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {selectedMethod === 'backup' && (
            <>
              <Text style={styles.inputLabel}>
                8 raqamli backup kodni kiriting:
              </Text>
              <TextInput
                style={[styles.codeInput, isMobile && styles.codeInputMobile]}
                placeholder="ABCD1234"
                value={backupCode}
                onChangeText={(text) => setBackupCode(text.toUpperCase())}
                maxLength={8}
                autoFocus
                autoCapitalize="characters"
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity
                style={[styles.verifyButton, loading && styles.buttonDisabled]}
                onPress={verifyBackupCode}
                disabled={loading || backupCode.length !== 8}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>← Orqaga qaytish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
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

  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  titleMobile: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 16,
    color: colors.placeholder,
    textAlign: 'center',
  },
  subtitleMobile: {
    fontSize: 18,
  },

  // Method Selection
  methodContainer: {
    marginBottom: 24,
  },
  methodButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodText: {
    fontSize: 16,
    color: colors.text,
  },
  methodTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Input Section
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  codeInput: {
    height: 56,
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: colors.surface,
    color: colors.text,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  codeInputMobile: {
    height: 60,
    fontSize: 28,
    borderRadius: 10,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // WebAuthn
  webauthnContainer: {
    alignItems: 'center',
  },
  webauthnStatus: {
    backgroundColor: colors.background,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  webauthnStatusText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
  },

  // Back Button
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
});