import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors } from '../styles/theme';

export default function ComposeScreen() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    if (!to || !subject || !body) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert('Email Sent!', `Your email has been sent successfully.\n\nTo: ${to}\nSubject: ${subject}`);
    setTo('');
    setSubject('');
    setBody('');
  };

  return (
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
  );
}

const styles = StyleSheet.create({
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


