import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ComposeModal({ visible, onClose, replyTo = null, draftData = null }) {
  const [to, setTo] = useState(replyTo?.from || draftData?.to || '');
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject}` : (draftData?.subject || '')
  );
  const [body, setBody] = useState(draftData?.body || '');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Animation values
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      Alert.alert('エラー', 'すべてのフィールドを入力してください');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/mails/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      if (response.ok) {
        Alert.alert('成功！', 'メールが正常に送信されました', [
          { text: 'OK', onPress: handleClose }
        ]);
        setTo(replyTo?.from || '');
        setSubject(replyTo ? `Re: ${replyTo.subject}` : '');
        setBody('');
      } else {
        const error = await response.json();
        Alert.alert('エラー', error.error || 'メール送信に失敗しました');
      }
    } catch (error) {
      console.error('Send email error:', error);
      Alert.alert('エラー', 'メール送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!to.trim() && !subject.trim() && !body.trim()) {
      Alert.alert('警告', '下書きとして保存するコンテンツがありません');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/mails/draft', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      if (response.ok) {
        Alert.alert('成功！', '下書きが正常に保存されました', [
          { text: 'OK', onPress: handleClose }
        ]);
      } else {
        Alert.alert('エラー', '下書きの保存に失敗しました');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      Alert.alert('エラー', '下書きの保存に失敗しました');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.3)" barStyle="light-content" />
      
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={styles.backdropTouchable} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>✏️ 新しいメッセージ</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleSaveDraft} style={styles.draftButton}>
                <Text style={styles.draftButtonText}>下書き保存</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>宛先:</Text>
              <TextInput
                style={styles.input}
                value={to}
                onChangeText={setTo}
                placeholder="受信者のメールアドレス"
                placeholderTextColor={colors.text.light}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>件名:</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="メールの件名"
                placeholderTextColor={colors.text.light}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>本文:</Text>
              <TextInput
                style={[styles.input, styles.bodyInput]}
                value={body}
                onChangeText={setBody}
                placeholder="メッセージをここに入力してください..."
                placeholderTextColor={colors.text.light}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.sendButton, loading && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>
                {loading ? '送信中...' : '送信'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    right: '15%',
    bottom: '10%',
    backgroundColor: 'rgba(255, 255, 255, 0.98)', // Slightly more opaque
    borderRadius: 24, // More rounded corners
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    // Enhanced blur and styling for web
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3)',
    }),
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 122, 255, 0.1)',
    backgroundColor: '#007AFF', // Beautiful blue to match send button
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    // Add gradient for web
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #007AFF 0%, #0056D3 100%)',
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  closeIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
  },
  draftButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  draftButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.DEFAULT,
    marginBottom: 8,
    width: '70%',
    textAlign: 'left',
  },
  input: {
    width: '70%',
    borderWidth: 0,
    borderRadius: 16, // More rounded
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text.DEFAULT,
    backgroundColor: 'rgba(248, 250, 252, 0.9)', // Slightly more opaque
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    // Enhanced styling for web
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
      transition: 'all 0.2s ease-in-out',
      boxShadow: '0 3px 12px rgba(0, 0, 0, 0.08)',
    }),
  },
  bodyInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.DEFAULT,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#007AFF', // Beautiful blue color
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 25, // More rounded for modern look
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    width: '65%',
    // Add gradient effect for web
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #007AFF 0%, #0056D3 100%)',
      boxShadow: '0 6px 20px rgba(0, 122, 255, 0.4)',
    }),
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B0B0',
    shadowColor: '#B0B0B0',
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #B0B0B0 0%, #909090 100%)',
      boxShadow: '0 4px 12px rgba(176, 176, 176, 0.3)',
    }),
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700', // Bolder text
    letterSpacing: 0.5, // Better spacing
  },
});