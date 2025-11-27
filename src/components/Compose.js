import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, Button, View } from 'react-native';

const Compose = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = () => {
    // Logic to send the email will go here
    console.log('Email sent to:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>To:</Text>
      <TextInput
        style={styles.input}
        value={to}
        onChangeText={setTo}
        placeholder="Recipient's email"
      />
      <Text style={styles.label}>Subject:</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="Email subject"
      />
      <Text style={styles.label}>Body:</Text>
      <TextInput
        style={styles.input}
        value={body}
        onChangeText={setBody}
        placeholder="Email body"
        multiline
        numberOfLines={4}
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});

export default Compose;