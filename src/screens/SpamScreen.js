import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../styles/theme';

const SpamScreen = ({ navigation }) => {
  // Sample spam emails data
  const spamEmails = [
    {
      id: '1',
      sender: 'noreply@suspicious-deals.com',
      subject: '🎉 CONGRATULATIONS! You\'ve won $1,000,000!!!',
      preview: 'Click here immediately to claim your prize! Limited time offer...',
      receivedTime: '2 hours ago',
      isPhishing: true,
    },
    {
      id: '2',
      sender: 'fake-bank@scam.org',
      subject: 'URGENT: Your account will be suspended',
      preview: 'We detected suspicious activity. Click here to verify your account...',
      receivedTime: '5 hours ago',
      isPhishing: true,
    },
    {
      id: '3',
      sender: 'promotions@random-store.net',
      subject: 'Get 90% OFF everything today only!',
      preview: 'Don\'t miss this incredible deal! Shop now before it\'s too late...',
      receivedTime: '1 day ago',
      isPhishing: false,
    },
    {
      id: '4',
      sender: 'prince@nigeria-funds.com',
      subject: 'Business Partnership Proposal',
      preview: 'I am Prince Abdullah and I have a business proposal for you...',
      receivedTime: '2 days ago',
      isPhishing: true,
    },
    {
      id: '5',
      sender: 'lottery@fake-lottery.biz',
      subject: 'You are the lucky winner of our lottery!',
      preview: 'Congratulations! Your email has been selected in our monthly lottery...',
      receivedTime: '3 days ago',
      isPhishing: true,
    },
    {
      id: '6',
      sender: 'ads@marketing-spam.com',
      subject: 'Make money from home - Easy work!',
      preview: 'Work from home and earn $500+ per day with our simple method...',
      receivedTime: '1 week ago',
      isPhishing: false,
    },
  ];

  const handleDeleteSpam = (emailId) => {
    Alert.alert(
      '迷惑メールを削除',
      'この迷惑メールを完全に削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '削除', style: 'destructive', onPress: () => console.log('Deleted:', emailId) },
      ]
    );
  };

  const renderSpamItem = ({ item }) => (
    <View style={styles.emailItem}>
      <View style={styles.emailHeader}>
        <View style={styles.senderInfo}>
          <Text style={styles.sender} numberOfLines={1}>{item.sender}</Text>
          {item.isPhishing && (
            <View style={styles.phishingBadge}>
              <Text style={styles.phishingText}>⚠️ フィッシング詐欺</Text>
            </View>
          )}
        </View>
        <Text style={styles.timestamp}>{item.receivedTime}</Text>
      </View>
      <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
      <Text style={styles.preview} numberOfLines={2}>{item.preview}</Text>
      <View style={styles.spamActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteSpam(item.id)}
        >
          <Text style={styles.deleteText}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.inboxInfoContainer}>
            <Text style={styles.pageTitle}>
              迷惑メール
            </Text>
            <Text style={styles.inboxTitle}>
              🚫 {spamEmails.length} 通
            </Text>
            <Text style={styles.warningInfo}>⚠️ これらのメールは有害な可能性があります</Text>
          </View>
        </View>
      </View>
      
      <FlatList
        data={spamEmails}
        renderItem={renderSpamItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.emailList}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearAllButton}>
          <Text style={styles.clearAllText}>すべての迷惑メールをクリア</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 2,
    minHeight: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  inboxInfoContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  inboxTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 1,
  },
  warningInfo: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '500',
  },
  emailList: {
    padding: 16,
    paddingBottom: 80,
  },
  emailItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffcccb',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.8,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  senderInfo: {
    flex: 1,
    marginRight: 8,
  },
  sender: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
    marginBottom: 4,
  },
  phishingBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  phishingText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  subject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  preview: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
    marginBottom: 12,
  },
  spamActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearAllButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 140,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default SpamScreen;
