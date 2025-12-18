import React, { useState, Fragment, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import NotificationModal from '../components/NotificationModal';

export default function ComposeScreen({ route }) {
  const { user } = useAuth();
  
  // Get params from navigation (for Reply/Forward)
  const params = route?.params || {};
  
  const [to, setTo] = useState(params.to || '');
  const [subject, setSubject] = useState(params.subject || '');
  const [body, setBody] = useState(params.body || '');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [emailPreview, setEmailPreview] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  const [lastSavedDraft, setLastSavedDraft] = useState('');
  const saveTimeoutRef = useRef(null);

  // Auto-save draft every 10 seconds if content changed
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const currentContent = `${to}-${subject}-${body}`;
    if (currentContent !== lastSavedDraft && (to || subject || body)) {
      saveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 10000); // 10 seconds delay
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [to, subject, body]);

  // Clear drafts when component mounts
  useEffect(() => {
    clearAllDrafts();
  }, []);

  const clearAllDrafts = async () => {
    if (!user || !user.token) return;

    try {
      await fetch('http://localhost:3002/api/mails/drafts/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Cleared all existing drafts');
    } catch (error) {
      console.error('❌ Error clearing drafts:', error);
    }
  };

  const saveDraft = async () => {
    if (!user || !user.token || (!to && !subject && !body)) return;

    try {
      const response = await fetch('http://localhost:3002/api/mails/draft', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to, subject, body })
      });

      if (response.ok) {
        setLastSavedDraft(`${to}-${subject}-${body}`);
        console.log('💾 Draft saved automatically');
      }
    } catch (error) {
      console.error('❌ Error saving draft:', error);
    }
  };

  const handleSend = async () => {
    if (!to || !subject || !body) {
      Alert.alert('エラー', 'すべてのフィールドを入力してください');
      return;
    }

    if (!user || !user.token) {
      Alert.alert('エラー', '認証が必要です。再度ログインしてください。');
      return;
    }

    try {
      console.log('📧 Sending email (Simple)...', { to, subject, body });
      
      const response = await fetch('http://localhost:3002/api/mails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          to,
          subject,
          body,
          confirmSend: false
        })
      });

      const result = await response.json();
      console.log('📧 Send response (Simple):', result);

      if (result.success) {
        if (result.requiresConfirmation) {
          // Show custom modal instead of Alert
          setEmailPreview(result.preview);
          setShowConfirmModal(true);
        } else {
          Alert.alert('メール送信完了', result.message || 'メールが正常に送信されました！');
          setTo('');
          setSubject('');
          setBody('');
        }
      } else {
        Alert.alert('エラー', result.error || 'メールの送信に失敗しました');
      }
    } catch (error) {
      console.error('Send error (Simple):', error);
      Alert.alert('エラー', 'ネットワークエラー。接続を確認してください。');
    }
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    
    try {
      const confirmResponse = await fetch('http://localhost:3002/api/mails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          to,
          subject,
          body,
          confirmSend: true
        })
      });

      const confirmResult = await confirmResponse.json();
      
      if (confirmResult.success) {
        // Show success notification
        setNotificationData({
          type: 'success',
          title: 'メール送信完了',
          message: confirmResult.message || '✅ メールが正常に送信されました！'
        });
        setShowNotification(true);
        
        // Clear form after successful send
        setTimeout(() => {
          setTo('');
          setSubject('');
          setBody('');
        }, 1500);
      } else {
        // Show error notification
        setNotificationData({
          type: 'error',
          title: '送信失敗',
          message: confirmResult.error || 'メールの送信に失敗しました。もう一度お試しください。'
        });
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Confirm send error:', error);
      setNotificationData({
        type: 'error',
        title: 'ネットワークエラー',
        message: 'ネットワークエラー。接続を確認してもう一度お試しください。'
      });
      setShowNotification(true);
    }
  };

  const handleCancelSend = () => {
    setShowConfirmModal(false);
    setEmailPreview(null);
  };

  return (
    <Fragment>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <Ionicons name="create" size={24} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.title}>メール作成</Text>
        </View>
        <Text style={styles.label}>宛先:</Text>
        <TextInput
          style={styles.input}
          value={to}
          onChangeText={setTo}
          placeholder="受信者のメールアドレス"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.placeholder}
        />
        <Text style={styles.label}>件名:</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="メールの件名"
          placeholderTextColor={colors.placeholder}
        />
        <Text style={styles.label}>メッセージ:</Text>
        <TextInput
          style={[styles.input, styles.bodyInput]}
          value={body}
          onChangeText={setBody}
          placeholder="メッセージを入力してください..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholderTextColor={colors.placeholder}
        />
        <View style={styles.buttonContainer}>
          <Button title="メールを送信" onPress={handleSend} color={colors.primary} />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={showConfirmModal}
        onClose={handleCancelSend}
        onConfirm={handleConfirmSend}
        title="メール送信確認"
        message="送信前にメール内容をご確認ください:"
        preview={emailPreview}
      />

      {/* Notification Modal */}
      <NotificationModal
        visible={showNotification}
        onClose={() => setShowNotification(false)}
        type={notificationData.type}
        title={notificationData.title}
        message={notificationData.message}
      />
    </Fragment>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1000 : undefined,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 18,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    color: colors.secondary,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    color: colors.text,
    opacity: 0.92,
  },
  label: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    height: 48,
    borderColor: colors.disabled,
    borderWidth: 1,
    marginBottom: 18,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  bodyInput: {
    height: 120,
    paddingTop: 12,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});


