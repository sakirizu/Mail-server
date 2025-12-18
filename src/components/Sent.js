import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

const Sent = ({ sentEmails }) => {
  return (
    <View style={[styles.container, { flex: 1 }]}>
      <Text style={styles.title}>Sent Emails</Text>
      <FlatList
        data={sentEmails}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.mailItem}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.recipient}>{item.recipient}</Text>
          </View>
        )}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  mailItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  subject: {
    fontSize: 18,
    fontWeight: '600',
  },
  recipient: {
    fontSize: 16,
    color: '#555',
  },
});

export default Sent;

