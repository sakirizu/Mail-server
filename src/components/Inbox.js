import React from 'react';
import { View, Text, FlatList } from 'react-native';
import MailItem from './MailItem';
import { useAuth } from '../context/AuthContext';
import { fetchInboxEmails } from '../services/mailService';

const Inbox = ({ emails }) => {
  return (
    <View style={{ flex: 1, width: '100%' }}>
      <FlatList
        data={emails}
        renderItem={({ item }) => <MailItem mail={item} />}
        keyExtractor={(item) => item.id.toString()}
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

export default Inbox;