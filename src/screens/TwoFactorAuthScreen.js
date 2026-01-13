import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      const response = await fetch('http://localhost:3002/api/2fa/status', {
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
      const response = await fetch('http://localhost:3002/api/2fa/webauthn/keys', {
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
      const response = await fetch('http://localhost:3002/api/2fa/totp/generate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTotpSecret(data);
      setShowTOTPSetup(true);
    } catch (error) {
      Alert.alert('エラー', 'TOTPシークレットの生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const enableTOTP = async () => {
    if (!totpCode) {
      Alert.alert('エラー', '認証コードを入力してください');
      return;
    }

    try {
      setLoading(true);
      const token = user.token;
      const response = await fetch('http://localhost:3002/api/2fa/totp/enable', {
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
        Alert.alert('成功', 'TOTPが有効になりました！バックアップコードを保存してください。');
      } else {
        Alert.alert('エラー', data.error);
      }
    } catch (error) {
      Alert.alert('エラー', 'TOTPの有効化に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const disableTOTP = async () => {
    if (!password) {
      Alert.alert('エラー', 'パスワードを入力してください');
      return;
    }

    Alert.alert(
      '確認',
      'TOTPを無効にしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '無効にする',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = user.token;
              const response = await fetch('http://localhost:3002/api/2fa/totp/disable', {
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
                Alert.alert('成功', 'TOTPが無効になりました');
              } else {
                Alert.alert('エラー', data.error);
              }
            } catch (error) {
              Alert.alert('エラー', 'TOTPの無効化に失敗しました');
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
      const response = await fetch('http://localhost:3002/api/2fa/webauthn/register/begin', {
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
        const verifyResponse = await fetch('http://localhost:3002/api/2fa/webauthn/register/complete', {
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
          Alert.alert('成功', 'セキュリティキーが登録されました');
        } else {
          Alert.alert('エラー', result.error);
        }
      } else {
        Alert.alert('エラー', 'WebAuthn brauzeringizda qo\'llab-quvvatlanmaydi');
      }
    } catch (error) {
      console.error('WebAuthn registration error:', error);
      Alert.alert('エラー', 'セキュリティキーの登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const removeWebAuthnKey = async (keyId) => {
    if (!password) {
      Alert.alert('エラー', 'Parolni kiriting');
      return;
    }

    Alert.alert(
      '確認',
      'セキュリティキーを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const token = user.token;
              const response = await fetch(`http://localhost:3002/api/2fa/webauthn/keys/${keyId}`, {
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
                Alert.alert('成功', 'セキュリティキーを削除しました');
              } else {
                Alert.alert('エラー', data.error);
              }
            } catch (error) {
              Alert.alert('エラー', 'セキュリティキーの削除に失敗しました');
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
      Alert.alert('エラー', 'Parolni kiriting');
      return;
    }

    try {
      setLoading(true);
      const token = user.token;
      const response = await fetch('http://localhost:3002/api/2fa/require', {
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
        Alert.alert('成功', require2FA ? '2FAが必須になりました' : '2FAが任意になりました');
      } else {
        Alert.alert('エラー', data.error);
      }
    } catch (error) {
      Alert.alert('エラー', '2FA設定の変更に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (!twoFAStatus) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <Text style={styles.title}>二段階認証 (2FA)</Text>
        <Text style={styles.subtitle}>アカウントのセキュリティを強化するために2FAを設定してください</Text>
      </View>

      {/* TOTP Section */}
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="lock-closed" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Google Authenticator / Authy (TOTP)</Text>
        </View>
        <Text style={styles.sectionDescription}>
          認証アプリによる時間ベースのコード生成 (Google Authenticator等)
        </Text>

        {twoFAStatus.totpEnabled ? (
          <View style={styles.enabledSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" style={{ marginRight: 8 }} />
              <Text style={styles.enabledText}>TOTP 有効</Text>
            </View>
            <View style={styles.actionSection}>
              <TextInput
                style={styles.passwordInput}
                placeholder="パスワード"
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
                <Text style={styles.dangerButtonText}>TOTP を無効にする</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={generateTOTPSecret}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>TOTP を設定する</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* WebAuthn Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔑 Hardware Security Key (FIDO2/WebAuthn)</Text>
        <Text style={styles.sectionDescription}>
          YubiKey 等のハードウェアセキュリティキーによる保護
        </Text>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={startWebAuthnRegistration}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>Security Key を追加</Text>
        </TouchableOpacity>

        {webauthnKeys.length > 0 && (
          <View style={styles.keysContainer}>
            <Text style={styles.keysTitle}>登録済みのキー:</Text>
            {webauthnKeys.map((key) => (
              <View key={key.id} style={styles.keyItem}>
                <View style={styles.keyInfo}>
                  <Text style={styles.keyName}>{key.name}</Text>
                  <Text style={styles.keyDate}>
                    登録日: {new Date(key.created_at).toLocaleDateString()}
                  </Text>
                  {key.last_used && (
                    <Text style={styles.keyDate}>
                      最終使用日: {new Date(key.last_used).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeKeyButton}
                  onPress={() => removeWebAuthnKey(key.id)}
                >
                  <Text style={styles.removeKeyText}>削除</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.actionSection}>
              <TextInput
                style={styles.passwordInput}
                placeholder="パスワード"
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
            <Text style={styles.sectionTitle}>2FA 設定</Text>
          </View>

          <View style={styles.requireSection}>
            <Text style={styles.requireText}>
              2FA の強制（ログイン時に常に要求されます）
            </Text>
            <View style={styles.actionSection}>
              <TextInput
                style={styles.passwordInput}
                placeholder="パスワード"
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
                    必須
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, !twoFAStatus.require2FA && styles.toggleButtonActive]}
                  onPress={() => toggleRequire2FA(false)}
                  disabled={loading}
                >
                  <Text style={[styles.toggleButtonText, !twoFAStatus.require2FA && styles.toggleButtonTextActive]}>
                    任意
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
          <ScrollView 
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>TOTP Sozlash</Text>

              <Text style={styles.modalStep}>1. QR kodni skanerlang yoki qo'lda kiriting:</Text>
              
              {/* QR Code va Manual Code yonma-yon */}
              <View style={styles.setupContainer}>
                <View style={styles.qrSection}>
                  <Text style={styles.sectionLabel}>QR Kod</Text>
                  <Image source={{ uri: totpSecret.qrCode }} style={styles.qrCode} />
                </View>
                
                <View style={styles.manualSection}>
                  <Text style={styles.sectionLabel}>Qo'lda Kod</Text>
                  <Text style={styles.secretKey}>{totpSecret.secret}</Text>
                  <Text style={styles.helpText}>
                    Agar skanerlay olmasangiz, bu kodni qo'lda kiriting
                  </Text>
                </View>
              </View>

              <Text style={styles.modalStep}>2. Ilovaldan 6 raqamli kodni kiriting:</Text>
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
                  <Text style={styles.confirmButtonText}>Keyingi</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Backup Codes Display */}
      {backupCodes.length > 0 && (
        <View style={styles.modal}>
          <ScrollView 
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.modalContent}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={60} color="#34C759" />
              </View>
              <Text style={styles.modalTitle}>Muvaffaqiyatli faollashtirildi!</Text>
              <Text style={styles.backupWarning}>
                ⚠️ Bu zaxira kodlarni xavfsiz joyda saqlang!
              </Text>
              <Text style={styles.backupSubtitle}>
                Har bir kod faqat bir marta ishlatilishi mumkin. Agar authentikator ilovangizga kirish imkoningiz bo'lmasa, bu kodlar sizni qutqaradi.
              </Text>

              <View style={styles.backupCodes}>
                {backupCodes.map((code, index) => (
                  <View key={index} style={styles.backupCodeItem}>
                    <Text style={styles.backupCodeNumber}>{index + 1}.</Text>
                    <Text style={styles.backupCode}>{code}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setBackupCodes([])}
              >
                <Text style={styles.confirmButtonText}>Saqlash tugmasi bosildi - Davom etish</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
  scrollContent: {
    paddingBottom: 30,
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
  modalScrollView: {
    maxHeight: '90%',
    width: '90%',
    maxWidth: 400,
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
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
  setupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 16,
    gap: 16,
  },
  qrSection: {
    flex: 1,
    alignItems: 'center',
  },
  manualSection: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  qrCode: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  secretKey: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
    color: colors.text,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpText: {
    fontSize: 11,
    color: colors.placeholder,
    fontStyle: 'italic',
    textAlign: 'center',
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
  successIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  backupSubtitle: {
    fontSize: 13,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  backupWarning: {
    fontSize: 15,
    color: '#ff6600',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  backupCodes: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backupCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  backupCodeNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 12,
    width: 25,
  },
  backupCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: colors.text,
    flex: 1,
  },
});


