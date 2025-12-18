import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Alert, Modal } from 'react-native';
import { colors } from '../styles/theme';
import { AuthContext } from '../context/AuthContext';

const MailDetailScreen = ({ route, navigation }) => {
  const { mail } = route.params || {};
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [showMenu, setShowMenu] = useState(false);
  const { token } = useContext(AuthContext);

  // Mark email as read when opened
  useEffect(() => {
    if (mail && mail.id && token) {
      markAsRead(mail.id);
    }
  }, [mail, token]);

  const markAsRead = async (mailId) => {
    try {
      const response = await fetch(`http://localhost:3002/api/mails/${mailId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Don't need to handle response since it's automatic
    } catch (error) {
      console.error('Error marking email as read:', error);
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
    navigation?.navigate('Compose', {
      to: mail.sender,
      subject: `Re: ${mail.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${mail.sender}\nSubject: ${mail.subject}\n\n${mail.snippet}`
    });
  };

  const handleForward = () => {
    navigation?.navigate('Compose', {
      subject: `Fwd: ${mail.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${mail.sender}\nSubject: ${mail.subject}\n\n${mail.body || mail.snippet}`
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMenuAction('archive')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🗃️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMenuAction('delete')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowMenu(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>⋮</Text>
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
              <Text style={styles.menuItemIcon}>📧</Text>
              <Text style={styles.menuItemText}>Mark as unread</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('addLabel')}>
              <Text style={styles.menuItemIcon}>🏷️</Text>
              <Text style={styles.menuItemText}>Add label</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('delete')}>
              <Text style={styles.menuItemIcon}>�️</Text>
              <Text style={styles.menuItemText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuAction('print')}>
              <Text style={styles.menuItemIcon}>🖨️</Text>
              <Text style={styles.menuItemText}>Print</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.emailContent}>
          <Text style={styles.subject}>{mail.subject}</Text>

          {/* Phishing Warning Banner */}
          {mail.phishing && mail.phishing.checked && mail.phishing.score > 0 && (
            <View style={[
              styles.phishingBanner,
              mail.phishing.score >= 70 ? styles.phishingDanger :
                mail.phishing.score >= 50 ? styles.phishingWarning :
                  mail.phishing.score >= 30 ? styles.phishingCaution :
                    styles.phishingSafe
            ]}>
              <Text style={styles.phishingIcon}>
                {mail.phishing.score >= 70 ? '🔴' :
                  mail.phishing.score >= 50 ? '🟠' :
                    mail.phishing.score >= 30 ? '🟡' : '🟢'}
              </Text>
              <View style={styles.phishingContent}>
                <Text style={styles.phishingTitle}>
                  {mail.phishing.score >= 70 ? 'Danger: High Risk Email' :
                    mail.phishing.score >= 50 ? 'Warning: Suspicious Email' :
                      mail.phishing.score >= 30 ? 'Caution: Check Carefully' :
                        'Low Risk'}
                </Text>
                <Text style={styles.phishingScore}>
                  Risk Score: {mail.phishing.score}%
                </Text>
                {mail.phishing.reasons && mail.phishing.reasons.length > 0 && (
                  <Text style={styles.phishingReasons}>
                    {mail.phishing.reasons.slice(0, 2).join(' • ')}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Spam folder warning */}
          {mail.isSpam && (
            <View style={[styles.phishingBanner, styles.phishingWarning]}>
              <Text style={styles.phishingIcon}>⚠️</Text>
              <View style={styles.phishingContent}>
                <Text style={styles.phishingTitle}>This message is in your Spam folder</Text>
                <Text style={styles.phishingReasons}>Exercise caution with links and attachments</Text>
              </View>
            </View>
          )}

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

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.replyButton} onPress={handleReply}>
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.forwardButton} onPress={handleForward}>
            <Text style={styles.forwardButtonText}>Forward</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  // Phishing Warning Styles
  phishingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  phishingDanger: {
    backgroundColor: '#FF000020',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  phishingWarning: {
    backgroundColor: '#FF880020',
    borderWidth: 1,
    borderColor: '#FF8800',
  },
  phishingCaution: {
    backgroundColor: '#FFD70020',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  phishingSafe: {
    backgroundColor: '#00FF0010',
    borderWidth: 1,
    borderColor: '#00AA00',
  },
  phishingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  phishingContent: {
    flex: 1,
  },
  phishingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  phishingScore: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  phishingReasons: {
    fontSize: 13,
    color: colors.placeholder,
    lineHeight: 18,
  },
});

export default MailDetailScreen;


