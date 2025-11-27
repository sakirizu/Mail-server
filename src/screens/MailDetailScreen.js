import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const MailDetailScreen = ({ route, navigation }) => {
  const { mail: rawMail } = route.params || {};
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const token = user?.token;

  // Normalize mail data - handle different field names from MongoDB
  const mail = rawMail ? {
    id: rawMail.id || rawMail._id,
    subject: rawMail.subject || '(No Subject)',
    sender: rawMail.sender || rawMail.from,
    body: rawMail.body || rawMail.snippet || '',
    date: rawMail.date || rawMail.created_at || rawMail.createdAt,
    read_status: rawMail.read_status || rawMail.isRead || false,
    isSpam: rawMail.isSpam || rawMail.folder === 'spam' || false,
    phishingScore: rawMail.phishingScore || 0,
    phishingReasons: rawMail.phishingReasons || [],
    ...rawMail
  } : null;

  // Debug: Log mail data
  useEffect(() => {
    console.log('📧 Mail Detail - Received mail data:', mail);
    if (!mail) {
      console.error('❌ No mail data received!');
    }
  }, []);

  // Mark email as read when opened
  useEffect(() => {
    const mailId = mail?.id || mail?._id;
    if (mail && mailId && token) {
      markAsRead(mailId);
    }
  }, [mail, token]);

  const markAsRead = async (mailId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mails/${mailId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Marked as read:', mailId);
    } catch (error) {
      console.error('❌ Error marking email as read:', error);
    }
  };
  
  if (!mail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>No email data found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleMenuAction = (action) => {
    setShowMenu(false);
    switch (action) {
      case 'delete':
        Alert.alert('Delete', 'Delete this email?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => navigation?.goBack() }
        ]);
        break;
      case 'archive':
        Alert.alert('Archive', 'Move to archive?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Archive', onPress: () => navigation?.goBack() }
        ]);
        break;
      case 'spam':
        Alert.alert('Spam', 'Mark as spam?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Mark as Spam', onPress: () => navigation?.goBack() }
        ]);
        break;
      case 'markUnread':
        Alert.alert('Success', 'Marked as unread', [{ text: 'OK' }]);
        break;
      case 'addLabel':
        Alert.alert('Labels', 'Add label functionality coming soon', [{ text: 'OK' }]);
        break;
      case 'print':
        Alert.alert('Print', 'Print functionality coming soon', [{ text: 'OK' }]);
        break;
      case 'settings':
        navigation?.navigate('Profile');
        break;
      case 'profile':
        navigation?.navigate('Profile');
        break;
    }
  };

  const handleReply = () => {
    const sender = mail.sender || mail.from;
    const originalSubject = mail.subject || '(No Subject)';
    const originalBody = mail.body || mail.snippet || '';
    
    navigation?.navigate('Compose', {
      to: sender,
      subject: originalSubject.startsWith('Re: ') ? originalSubject : `Re: ${originalSubject}`,
      body: `\n\n\n--- Original Message ---\nFrom: ${sender}\nDate: ${mail.date || 'Unknown'}\nSubject: ${originalSubject}\n\n${originalBody}`
    });
  };

  const handleForward = () => {
    const sender = mail.sender || mail.from;
    const originalSubject = mail.subject || '(No Subject)';
    const originalBody = mail.body || mail.snippet || '';
    
    navigation?.navigate('Compose', {
      to: '',
      subject: originalSubject.startsWith('Fwd: ') ? originalSubject : `Fwd: ${originalSubject}`,
      body: `\n\n\n--- Forwarded Message ---\nFrom: ${sender}\nDate: ${mail.date || 'Unknown'}\nSubject: ${originalSubject}\n\n${originalBody}`
    });
  };

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      {/* Gmail-style header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleMenuAction('archive')}
            activeOpacity={0.7}
          >
            <Ionicons name="archive-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleMenuAction('delete')}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowMenu(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 3-Dot Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('markUnread')}>
              <Ionicons name="mail-unread-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText}>Mark as unread</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('addLabel')}>
              <Ionicons name="pricetag-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText}>Add label</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('delete')}>
              <Ionicons name="trash-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('print')}>
              <Ionicons name="print-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
              <Text style={styles.menuItemText}>Print</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.emailContent}>
          <Text style={styles.subject}>{mail.subject}</Text>
          <View style={styles.senderInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {mail.sender?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.senderDetails}>
              <Text style={styles.sender}>{mail.sender}</Text>
              <Text style={styles.date}>Today at 2:30 PM</Text>
            </View>
          </View>
          <View style={styles.bodyContainer}>
            <Text style={styles.body}>
              {mail.body || mail.snippet || "Email content would be displayed here..."}
            </Text>
          </View>
        </View>

        {mail.isSpam && (
          <View style={styles.spamWarning}>
            <Ionicons name="warning" size={24} color="#FF3B30" />
            <View style={styles.spamWarningText}>
              <Text style={styles.spamWarningTitle}>⚠️ 迷惑メール (Spam)</Text>
              <Text style={styles.spamWarningDesc}>
                このメールは有害な可能性があります。返信や転送はできません。
              </Text>
              {mail.phishingScore > 0 && (
                <Text style={styles.spamWarningScore}>
                  検出スコア: {mail.phishingScore}%
                </Text>
              )}
            </View>
          </View>
        )}

        {!mail.isSpam && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.replyButton} onPress={handleReply}>
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.forwardButton} onPress={handleForward}>
              <Text style={styles.forwardButtonText}>Forward</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
  },
  containerDesktop: {
    maxWidth: 1000,
    alignSelf: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '15',
  },
  backIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '10',
  },
  actionIcon: {
    fontSize: 20,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  emailContent: {
    padding: 24,
  },
  subject: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    lineHeight: 32,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  senderDetails: {
    flex: 1,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.placeholder,
  },
  bodyContainer: {
    marginTop: 8,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  replyButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 24,
    alignItems: 'center',
  },
  replyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  forwardButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 24,
    alignItems: 'center',
  },
  forwardButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  error: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  menuItemIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  spamWarning: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FF9500',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    alignItems: 'flex-start',
  },
  spamWarningText: {
    flex: 1,
    marginLeft: 12,
  },
  spamWarningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  spamWarningDesc: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  spamWarningScore: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default MailDetailScreen;
