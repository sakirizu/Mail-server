import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

export default function InboxScreen() {
  console.log('InboxScreen rendering...');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📬 Inbox Screen</Text>
      <Text style={styles.subtitle}>This is the inbox page</Text>
      <Text style={styles.text}>Email 1: Welcome to our app!</Text>
      <Text style={styles.text}>Email 2: Your account is ready</Text>
      <Text style={styles.text}>Email 3: New features available</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // padding: 24,
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
