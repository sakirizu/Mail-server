import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../styles/theme';

const DeleteAccountScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [challengeToken, setChallengeToken] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCodesAvailable, setBackupCodesAvailable] = useState(0);

  const initiateAccountDeletion = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/account/delete/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setChallengeToken(data.challengeToken);
        setBackupCodesAvailable(data.backupCodesAvailable);
        setShowConfirmModal(true);
      } else {
        Alert.alert('エラー', data.error);
      }
    } catch (error) {
      Alert.alert('エラー', 'Serverga ulanishda エラー');
    } finally {
      setLoading(false);
    }
  };

  const confirmAccountDeletion = async () => {
    if (!totpCode && !backupCode) {
      Alert.alert('エラー', '2FA kod yoki backup kod kiriting');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/account/delete/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          challengeToken,
          totpCode: useBackupCode ? null : totpCode,
          backupCode: useBackupCode ? backupCode : null
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert(
          'Muvaffaqiyat', 
          'Hisobingiz o\'chirildi', 
          [
            { 
              text: 'OK', 
              onPress: () => {
                logout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('エラー', data.error);
      }
    } catch (error) {
      Alert.alert('エラー', 'Serverga ulanishda エラー');
    } finally {
      setLoading(false);
    }
  };

  const showInitialWarning = () => {
    Alert.alert(
      '⚠️ Hisob O\'chirish',
      'Bu amalni bekor qilib bo\'lmaydi! Barcha ma\'lumotlaringiz o\'chiriladi:\n\n• Barcha emaillaringiz\n• Shaxsiy ma\'lumotlaringiz\n• 2FA sozlamalari\n• Backup kodlaringiz\n\nDavom etishni xohlaysizmi?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { 
          text: 'Ha, o\'chirish', 
          style: 'destructive',
          onPress: initiateAccountDeletion 
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hisob O'chirish</Text>
        <Text style={styles.subtitle}>
          Hisobingizni butunlay o'chirish
        </Text>
      </View>

      <View style={styles.warningCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Ionicons name="warning" size={24} color="#FF3B30" style={{ marginRight: 8 }} />
          <Text style={styles.warningTitle}>Diqqat!</Text>
        </View>
        <Text style={styles.warningText}>
          Bu amal qaytarib bo'lmaydigan jarayondir. Hisobingizni o'chirgandan so'ng:
        </Text>
        <View style={styles.warningList}>
          <Text style={styles.warningItem}>• Barcha emaillaringiz o'chiriladi</Text>
          <Text style={styles.warningItem}>• Shaxsiy ma'lumotlaringiz o'chiriladi</Text>
          <Text style={styles.warningItem}>• 2FA sozlamalari o'chiriladi</Text>
          <Text style={styles.warningItem}>• Backup kodlaringiz o'chiriladi</Text>
          <Text style={styles.warningItem}>• Bu amalni bekor qilib bo'lmaydi</Text>
        </View>
      </View>

      <View style={styles.requirementCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="lock-closed" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.requirementTitle}>2FA Talab</Text>
        </View>
        <Text style={styles.requirementText}>
          Xavfsizlik uchun hisob o'chirish jarayonida 2FA verification talab qilinadi.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.deleteButton, loading && styles.buttonDisabled]}
        onPress={showInitialWarning}
        disabled={loading}
      >
        <Text style={styles.deleteButtonText}>
          {loading ? 'Jarayon boshlanyapti...' : '🗑️ Hisobni O\'chirish'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Bekor qilish</Text>
      </TouchableOpacity>

      {/* 2FA Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="lock-closed" size={24} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>2FA Tasdiqlash</Text>
            </View>
            
            <Text style={styles.modalDescription}>
              Hisob o'chirish jarayonini yakunlash uchun 2FA kodni kiriting:
            </Text>

            <View style={styles.codeTypeSelector}>
              <TouchableOpacity
                style={[
                  styles.codeTypeButton,
                  !useBackupCode && styles.codeTypeButtonActive
                ]}
                onPress={() => {
                  setUseBackupCode(false);
                  setBackupCode('');
                }}
              >
                <Text style={[
                  styles.codeTypeButtonText,
                  !useBackupCode && styles.codeTypeButtonTextActive
                ]}>
                  TOTP Kod
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.codeTypeButton,
                  useBackupCode && styles.codeTypeButtonActive
                ]}
                onPress={() => {
                  setUseBackupCode(true);
                  setTotpCode('');
                }}
              >
                <Text style={[
                  styles.codeTypeButtonText,
                  useBackupCode && styles.codeTypeButtonTextActive
                ]}>
                  Backup Kod ({backupCodesAvailable})
                </Text>
              </TouchableOpacity>
            </View>

            {!useBackupCode ? (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Google Authenticator kodini kiriting:</Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="123456"
                  value={totpCode}
                  onChangeText={setTotpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor={colors.placeholder}
                />
              </View>
            ) : (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Backup kodini kiriting:</Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="XXXXXXXX"
                  value={backupCode}
                  onChangeText={setBackupCode}
                  maxLength={8}
                  placeholderTextColor={colors.placeholder}
                  autoCapitalize="characters"
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.confirmDeleteButton, loading && styles.buttonDisabled]}
                onPress={confirmAccountDeletion}
                disabled={loading || (!totpCode && !backupCode)}
              >
                <Text style={styles.confirmDeleteButtonText}>
                  {loading ? 'O\'chirilmoqda...' : '🗑️ Tasdiqlash va O\'chirish'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowConfirmModal(false);
                  setTotpCode('');
                  setBackupCode('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Bekor qilish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  warningText: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 12,
    lineHeight: 20,
  },
  warningList: {
    paddingLeft: 10,
  },
  warningItem: {
    fontSize: 14,
    color: '#d32f2f',
    marginBottom: 5,
    lineHeight: 18,
  },
  requirementCard: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ff9800',
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#f57c00',
    lineHeight: 18,
  },
  deleteButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.text,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  codeTypeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  codeTypeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  codeTypeButtonActive: {
    backgroundColor: colors.primary,
  },
  codeTypeButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  codeTypeButtonTextActive: {
    color: colors.white,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: colors.white,
  },
  modalButtons: {
    gap: 12,
  },
  confirmDeleteButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    borderWidth: 1,
    borderColor: colors.text,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: colors.text,
    fontSize: 16,
  },
});

export default DeleteAccountScreen;

