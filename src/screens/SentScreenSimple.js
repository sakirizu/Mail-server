import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

export default function SentScreen() {
  console.log('SentScreen rendering...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📤 Sent Screen</Text>
      <Text style={styles.subtitle}>Your sent emails</Text>
      <Text style={styles.text}>Sent 1: Meeting follow-up</Text>
      <Text style={styles.text}>Sent 2: Project update</Text>
      <Text style={styles.text}>Sent 3: Thank you note</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
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
});


