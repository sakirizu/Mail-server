import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    color: '#666',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    color: '#333',
  },
});
