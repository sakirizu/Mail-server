import React, { useState, Fragment } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

export default function ComposeScreen() {
  const { user } = useAuth();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [emailPreview, setEmailPreview] = useState(null);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!user || !user.token) {
      Alert.alert('Error', 'Authentication required. Please login again.');
      return;
    }

    try {
      console.log('📧 Sending email (Simple)...', { to, subject, body });
      
      const response = await fetch('http://localhost:4000/api/mails/send', {
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
          Alert.alert('Email Sent!', result.message || 'Email sent successfully!');
          setTo('');
          setSubject('');
          setBody('');
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Send error (Simple):', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    }
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    
    try {
      const confirmResponse = await fetch('http://localhost:4000/api/mails/send', {
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
        Alert.alert('Email Sent!', confirmResult.message || 'Email sent successfully!');
        setTo('');
        setSubject('');
        setBody('');
      } else {
        Alert.alert('Error', confirmResult.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Confirm send error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
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
        <Text style={styles.title}>✏️ Compose Email</Text>
        <Text style={styles.label}>To:</Text>
        <TextInput
          style={styles.input}
          value={to}
          onChangeText={setTo}
          placeholder="Recipient's email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={colors.placeholder}
        />
        <Text style={styles.label}>Subject:</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Email subject"
          placeholderTextColor={colors.placeholder}
        />
        <Text style={styles.label}>Message:</Text>
        <TextInput
          style={[styles.input, styles.bodyInput]}
          value={body}
          onChangeText={setBody}
          placeholder="Write your message here..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholderTextColor={colors.placeholder}
        />
        <View style={styles.buttonContainer}>
          <Button title="Send Email" onPress={handleSend} color={colors.primary} />
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={showConfirmModal}
        onClose={handleCancelSend}
        onConfirm={handleConfirmSend}
        title="Confirm Email Send"
        message="Please review your email before sending:"
        preview={emailPreview}
      />
    </Fragment>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    width: '100%', // web uchun max-width emas, width: 100%
    width: Platform.OS === 'web' ? undefined : 1000,
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
