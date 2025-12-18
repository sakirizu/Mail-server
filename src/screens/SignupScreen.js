import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Step 1: Name
  const handleNextName = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    setStep(2);
  };

  // Step 2: Username
  const handleNextUsername = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    // Username faqat harflar, raqamlar va _ bo'lishi kerak
    const valid = /^[a-zA-Z0-9_]+$/.test(username);
    if (!valid) {
      Alert.alert('Error', 'Username faqat harflar, raqamlar va _ bo‘lishi mumkin');
      return;
    }
    setStep(3);
  };

  // Step 3: Password & Create
  const handleCreateEmail = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    setLoading(true);
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    try {
      const res = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, username: trimmedUsername, password })
      });
      const data = await res.json();
      console.log('Signup response:', data);
      if (res.ok && data.success) {
        Alert.alert('Success', `Account created! Your email: ${data.email}`);
        navigation.navigate('Login', { createdEmail: data.email });
      } else if (data && data.error) {
        Alert.alert('Error', data.error);
      } else {
        Alert.alert('Error', 'Signup failed');
      }
    } catch (e) {
      console.log('Signup error:', e);
      Alert.alert('Error', 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Email</Text>
      {step === 1 && (
        <>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholderTextColor={colors.placeholder}
          />
          <Button title="Next" onPress={handleNextName} color={colors.primary} />
        </>
      )}
      {step === 2 && (
        <>
          <Text style={styles.label}>Choose a Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor={colors.placeholder}
          />
          <Text style={styles.emailPreview}>Your email will be:</Text>
          <Text style={styles.email}>{username ? username + '@ssm.com' : 'username@ssm.com'}</Text>
          <Button title="Next" onPress={handleNextUsername} color={colors.primary} />
        </>
      )}
      {step === 3 && (
        <>
          <Text style={styles.label}>Create a Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.placeholder}
          />
          <Button title={loading ? 'Creating...' : 'Create Email'} onPress={handleCreateEmail} color={colors.primary} disabled={loading} />
        </>
      )}
      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Already have an account? Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 32,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  input: {
    height: 48,
    borderColor: colors.disabled,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 18,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  emailPreview: {
    color: colors.placeholder,
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
    textAlign: 'center',
  },
  link: {
    color: colors.primary,
    marginTop: 18,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});


