import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ScrollView } from 'react-native';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function TwoFactorAuthScreen() {
  const [twoFAStatus, setTwoFAStatus] = useState(null);
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [showWebAuthnSetup, setShowWebAuthnSetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [webauthnKeys, setWebauthnKeys] = useState([]);
  const [backupCodes, setBackupCodes] = useState([]);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadTwoFAStatus();
    loadWebAuthnKeys();
  }, []);

  const loadTwoFAStatus = async () => {
    try {
      const token = user.token;
      const response = await fetch('http://10.2.145.211:4000/api/2fa/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTwoFAStatus(data);
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
    }
  };

  const loadWebAuthnKeys = async () => {
    try {
      const token = user.token;
      const response = await fetch('http://10.2.145.211:4000/api/2fa/webauthn/keys', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setWebauthnKeys(data);
    } catch (error) {
      console.error('Failed to load WebAuthn keys:', error);
    }
  };

  const generateTOTPSecret = async () => {
    try {
      setLoading(true);
      const token = user.token;
      const response = await fetch('http://10.2.145.211:4000/api/2fa/totp/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTotpSecret(data);
      setShowTOTPSetup(true);
    } catch (error) {
      Alert.alert('Xatolik', 'TOTP secret yaratishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const enableTOTP = async () => {
    if (!totpCode) {
      Alert.alert('Xatolik', 'TOTP kodni kiriting');
      return;
    }

    try {
      setLoading(true);
      const token = user.token;
      const response = await fetch('http://10.2.145.211:4000/api/2fa/totp/enable', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: totpCode })
      });
      const data = await response.json();
      
      if (data.success) {
        setBackupCodes(data.backupCodes);
        setShowTOTPSetup(false);
        setTotpCode('');
        loadTwoFAStatus();
        Alert.alert('Muvaffaqiyat', 'TOTP yoqildi! Backup kodlarni saqlang.');
      } else {
        Alert.alert('Xatolik', data.error);
      }
    } catch (error) {
      Alert.alert('Xatolik', 'TOTP yoqishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const disableTOTP = async () => {
    if (!password) {
      Alert.alert('Xatolik', 'Parolni kiriting');
      return;
    }

    Alert.alert(
      'Tasdiqlash',
      'TOTP ni o\'chirmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { 
          text: 'O\'chirish', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = user.token;
              const response = await fetch('http://10.2.145.211:4000/api/2fa/totp/disable', {
                method: 'POST',
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
              });
              const data = await response.json();
              
              if (data.success) {
                setPassword('');
                loadTwoFAStatus();
                Alert.alert('Muvaffaqiyat', 'TOTP o\'chirildi');
              } else {
                Alert.alert('Xatolik', data.error);
              }
            } catch (error) {
              Alert.alert('Xatolik', 'TOTP o\'chirishda xatolik');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const startWebAuthnRegistration = async () => {
    try {
      setLoading(true);
      const token = user.token;
      
      // Get registration options from server
      const response = await fetch('http://10.2.145.211:4000/api/2fa/webauthn/register/begin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { options, sessionToken } = await response.json();

      // Start WebAuthn registration
      if (navigator.credentials && navigator.credentials.create) {
        const credential = await navigator.credentials.create({
          publicKey: {
            ...options,
            challenge: new Uint8Array(options.challenge),
            user: {
              ...options.user,
              id: new Uint8Array(options.user.id)
            },
            excludeCredentials: options.excludeCredentials?.map(cred => ({
              ...cred,
              id: new Uint8Array(cred.id)
            }))
          }
        });

        // Send registration response to server
        const verifyResponse = await fetch('http://10.2.145.211:4000/api/2fa/webauthn/register/complete', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sessionToken,
            response: {
              id: credential.id,
              rawId: Array.from(new Uint8Array(credential.rawId)),
              response: {
                clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
                attestationObject: Array.from(new Uint8Array(credential.response.attestationObject))
              },
              type: credential.type
            }
          })
        });

        const result = await verifyResponse.json();
        if (result.success) {
          loadTwoFAStatus();
          loadWebAuthnKeys();
          Alert.alert('Muvaffaqiyat', 'Security key qo\'shildi');
        } else {
          Alert.alert('Xatolik', result.error);
        }
      } else {
        Alert.alert('Xatolik', 'WebAuthn brauzeringizda qo\'llab-quvvatlanmaydi');
      }
    } catch (error) {
      console.error('WebAuthn registration error:', error);
      Alert.alert('Xatolik', 'Security key qo\'shishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const removeWebAuthnKey = async (keyId) => {
    if (!password) {
      Alert.alert('Xatolik', 'Parolni kiriting');
      return;
    }

    Alert.alert(
      'Tasdiqlash',
      'Security key ni o\'chirmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { 
          text: 'O\'chirish', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = user.token;
              const response = await fetch(`http://10.2.145.211:4000/api/2fa/webauthn/keys/${keyId}`, {
                method: 'DELETE',
                headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
              });
              const data = await response.json();
              
              if (data.success) {
                setPassword('');
                loadTwoFAStatus();
                loadWebAuthnKeys();
                Alert.alert('Muvaffaqiyat', 'Security key o\'chirildi');
              } else {
                Alert.alert('Xatolik', data.error);
              }
            } catch (error) {
              Alert.alert('Xatolik', 'Security key o\'chirishda xatolik');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const toggleRequire2FA = async (require2FA) => {
    if (!password) {
      Alert.alert('Xatolik', 'Parolni kiriting');
      return;
    }

    try {
      setLoading(true);
      const token = user.token;
      const response = await fetch('http://10.2.145.211:4000/api/2fa/require', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ require2FA, password })
      });
      const data = await response.json();
      
      if (data.success) {
        setPassword('');
        loadTwoFAStatus();
        Alert.alert('Muvaffaqiyat', require2FA ? '2FA majburiy qilindi' : '2FA majburiy emas');
      } else {
        Alert.alert('Xatolik', data.error);
      }
    } catch (error) {
      Alert.alert('Xatolik', '2FA sozlamalarini o\'zgartirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (!twoFAStatus) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ikki Bosqichli Autentifikatsiya (2FA)</Text>
        <Text style={styles.subtitle}>Hisobingizni qo'shimcha himoya qilish uchun 2FA ni yoqing</Text>
      </View>

      {/* TOTP Section */}
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="lock-closed" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Google Authenticator / Authy (TOTP)</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Mobil ilovals orqali vaqtga asoslangan kod yaratish
        </Text>
        
        {twoFAStatus.totpEnabled ? (
          <View style={styles.enabledSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" style={{ marginRight: 8 }} />
              <Text style={styles.enabledText}>TOTP yoqilgan</Text>
            </View>
            <View style={styles.actionSection}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Parol"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity 
                style={[styles.dangerButton, loading && styles.buttonDisabled]}
                onPress={disableTOTP}
                disabled={loading}
              >
                <Text style={styles.dangerButtonText}>TOTP ni o'chirish</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={generateTOTPSecret}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>TOTP ni sozlash</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* WebAuthn Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 Hardware Security Key (FIDO2/WebAuthn)</Text>
        <Text style={styles.sectionDescription}>
          YubiKey yoki boshqa apparat kalitlar orqali himoya
        </Text>
        
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={startWebAuthnRegistration}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>Security Key qo'shish</Text>
        </TouchableOpacity>

        {webauthnKeys.length > 0 && (
          <View style={styles.keysContainer}>
            <Text style={styles.keysTitle}>Ro'yxatdan o'tgan kalitlar:</Text>
            {webauthnKeys.map((key) => (
              <View key={key.id} style={styles.keyItem}>
                <View style={styles.keyInfo}>
                  <Text style={styles.keyName}>{key.name}</Text>
                  <Text style={styles.keyDate}>
                    Qo'shilgan: {new Date(key.created_at).toLocaleDateString()}
                  </Text>
                  {key.last_used && (
                    <Text style={styles.keyDate}>
                      Oxirgi foydalanish: {new Date(key.last_used).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={styles.removeKeyButton}
                  onPress={() => removeWebAuthnKey(key.id)}
                >
                  <Text style={styles.removeKeyText}>O'chirish</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            <View style={styles.actionSection}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Parol"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>
        )}
      </View>

      {/* 2FA Requirement Section */}
      {(twoFAStatus.totpEnabled || twoFAStatus.webauthnEnabled) && (
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="settings" size={22} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>2FA Sozlamalari</Text>
          </View>
          
          <View style={styles.requireSection}>
            <Text style={styles.requireText}>
              2FA ni majburiy qilish (kirish paytida doimo talab qilinadi)
            </Text>
            <View style={styles.actionSection}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Parol"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.placeholder}
              />
              <View style={styles.toggleButtons}>
                <TouchableOpacity 
                  style={[styles.toggleButton, twoFAStatus.require2FA && styles.toggleButtonActive]}
                  onPress={() => toggleRequire2FA(true)}
                  disabled={loading}
                >
                  <Text style={[styles.toggleButtonText, twoFAStatus.require2FA && styles.toggleButtonTextActive]}>
                    Majburiy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toggleButton, !twoFAStatus.require2FA && styles.toggleButtonActive]}
                  onPress={() => toggleRequire2FA(false)}
                  disabled={loading}
                >
                  <Text style={[styles.toggleButtonText, !twoFAStatus.require2FA && styles.toggleButtonTextActive]}>
                    Ixtiyoriy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* TOTP Setup Modal */}
      {showTOTPSetup && totpSecret && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>TOTP Sozlash</Text>
            
            <Text style={styles.modalStep}>1. QR kodni skanerlang:</Text>
            <Image source={{ uri: totpSecret.qrCode }} style={styles.qrCode} />
            
            <Text style={styles.modalStep}>2. Yoki qo'lda kod kiriting:</Text>
            <Text style={styles.secretKey}>{totpSecret.secret}</Text>
            
            <Text style={styles.modalStep}>3. Ilovaldan 6 raqamli kodni kiriting:</Text>
            <TextInput
              style={styles.totpInput}
              placeholder="123456"
              value={totpCode}
              onChangeText={setTotpCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor={colors.placeholder}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowTOTPSetup(false);
                  setTotpCode('');
                }}
              >
                <Text style={styles.cancelButtonText}>Bekor qilish</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, loading && styles.buttonDisabled]}
                onPress={enableTOTP}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>Tasdiqlash</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Backup Codes Display */}
      {backupCodes.length > 0 && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Backup Kodlar</Text>
            <Text style={styles.backupWarning}>
              Bu kodlarni xavfsiz joyda saqlang! Har bir kod faqat bir marta ishlatiladi.
            </Text>
            
            <View style={styles.backupCodes}>
              {backupCodes.map((code, index) => (
                <Text key={index} style={styles.backupCode}>{code}</Text>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => setBackupCodes([])}
            >
              <Text style={styles.confirmButtonText}>Men saqladim</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: colors.placeholder,
  },
  header: {
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.placeholder,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.placeholder,
    marginBottom: 16,
  },
  enabledSection: {
    backgroundColor: colors.primary + '10',
    padding: 12,
    borderRadius: 8,
  },
  enabledText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionSection: {
    marginTop: 12,
  },
  passwordInput: {
    height: 48,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: colors.background,
    color: colors.text,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  keysContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  keysTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  keyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  keyInfo: {
    flex: 1,
  },
  keyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  keyDate: {
    fontSize: 12,
    color: colors.placeholder,
    marginTop: 2,
  },
  removeKeyButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  removeKeyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requireSection: {
    marginTop: 8,
  },
  requireText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  toggleButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalStep: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  qrCode: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 16,
  },
  secretKey: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
  },
  totpInput: {
    height: 48,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: colors.background,
    color: colors.text,
    marginBottom: 20,
    fontFamily: 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backupWarning: {
    fontSize: 14,
    color: '#ff6600',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  backupCodes: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  backupCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: colors.text,
    textAlign: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
});