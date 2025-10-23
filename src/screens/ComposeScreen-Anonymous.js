import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ScrollView, useWindowDimensions, ActivityIndicator, Modal } from 'react-native';
import { colors } from '../styles/theme';
import { sendEmail } from '../services/mailService';
import { useAuth } from '../context/AuthContext';

export default function ComposeScreen({ navigation }) {
  const { user } = useAuth();
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 768;

  const handleSend = async () => {
    if (!to || !subject || !body) {
      Alert.alert('Error', 'Please fill in required fields (To, Subject, and Message)');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSend = async () => {
    setShowConfirmDialog(false);
    setSending(true);
    
    try {
      const emailData = {
        to: to.trim(),
        cc: cc.trim(),
        bcc: bcc.trim(),
        subject: subject.trim(),
        body: body.trim()
      };

      const response = await sendEmail(emailData, user?.token);
      
      if (response.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          // Clear form
          setTo('');
          setCc('');
          setBcc('');
          setSubject('');
          setBody('');
          setShowCcBcc(false);
          // Navigate back
          navigation.goBack();
        }, 2000);
      } else {
        Alert.alert(
          'Error',
          response.error || 'Failed to send email. Please try again.'
        );
      }
    } catch (error) {
      console.error('Send email error:', error);
      Alert.alert(
        'Error',
        'Failed to send email. Please check your connection and try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard draft?',
      'Are you sure you want to discard this draft?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => navigation?.goBack?.()
        }
      ]
    );
  };

  return (
    <View style={[
      styles.container, 
      isDesktop && styles.containerDesktop,
      isMobile && styles.containerMobile,
      { flex: 1 }
    ]}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={styles.headerContent}>
          <View style={styles.pageInfoContainer}>
            <Text style={[styles.pageTitle, isMobile && styles.pageTitleMobile]}>
              Compose
            </Text>
            <Text style={[styles.pageSubtitle, isMobile && styles.pageSubtitleMobile]}>
              ✏️ New mail
            </Text>
          </View>
        </View>
        <View style={[styles.headerButtons, isMobile && styles.headerButtonsMobile]}>
          <TouchableOpacity 
            style={[styles.discardButton, isMobile && styles.discardButtonMobile]} 
            onPress={handleDiscard}
            activeOpacity={0.6}
            android_ripple={{ color: colors.error + '20', borderless: false }}
          >
            <Text style={[styles.discardButtonText, isMobile && styles.discardButtonTextMobile]}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              isMobile && styles.sendButtonMobile,
              sending && { opacity: 0.7 }
            ]} 
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.6}
            android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: false }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={[styles.sendButtonText, isMobile && styles.sendButtonTextMobile]}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={[styles.formContainer, { flex: 1 }]}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
          <Text style={[styles.label, isMobile && styles.labelMobile]}>To *</Text>
          <TextInput
            style={[styles.input, isMobile && styles.inputMobile]}
            value={to}
            onChangeText={setTo}
            placeholder="Recipients"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        {!showCcBcc && (
          <TouchableOpacity 
            onPress={() => setShowCcBcc(true)}
            style={isMobile && styles.ccBccLinkContainerMobile}
            activeOpacity={0.6}
          >
            <Text style={[styles.ccBccLink, isMobile && styles.ccBccLinkMobile]}>Add Cc & Bcc</Text>
          </TouchableOpacity>
        )}

        {showCcBcc && (
          <>
            <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
              <Text style={[styles.label, isMobile && styles.labelMobile]}>Cc</Text>
              <TextInput
                style={[styles.input, isMobile && styles.inputMobile]}
                value={cc}
                onChangeText={setCc}
                placeholder="Carbon copy"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
              />
            </View>

            <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
              <Text style={[styles.label, isMobile && styles.labelMobile]}>Bcc</Text>
              <TextInput
                style={[styles.input, isMobile && styles.inputMobile]}
                value={bcc}
                onChangeText={setBcc}
                placeholder="Blind carbon copy"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </>
        )}

        <View style={[styles.inputContainer, isMobile && styles.inputContainerMobile]}>
          <Text style={[styles.label, isMobile && styles.labelMobile]}>Subject *</Text>
          <TextInput
            style={[styles.input, isMobile && styles.inputMobile]}
            value={subject}
            onChangeText={setSubject}
            placeholder="Email subject"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <View style={[styles.inputContainer, styles.bodyContainer, isMobile && styles.bodyContainerMobile]}>
          <Text style={[styles.label, isMobile && styles.labelMobile]}>Message *</Text>
          <TextInput
            style={[styles.input, styles.bodyInput, isMobile && styles.bodyInputMobile]}
            value={body}
            onChangeText={setBody}
            placeholder="Compose your message..."
            multiline
            numberOfLines={isMobile ? 8 : (isDesktop ? 15 : 10)}
            textAlignVertical="top"
            placeholderTextColor={colors.placeholder}
          />
        </View>
      </ScrollView>

      {/* Confirmation Dialog */}
      <Modal
        visible={showConfirmDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmDialog(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.confirmationModal, { maxWidth: isDesktop ? 700 : '95%' }]}>
            <Text style={styles.modalTitle}>Confirm Email</Text>
            
            <View style={styles.confirmationDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>To:</Text>
                <Text style={styles.detailValue}>{to}</Text>
              </View>
              
              {cc && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>CC:</Text>
                  <Text style={styles.detailValue}>{cc}</Text>
                </View>
              )}
              
              {bcc && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>BCC:</Text>
                  <Text style={styles.detailValue}>{bcc}</Text>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subject:</Text>
                <Text style={styles.detailValue}>{subject}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Message:</Text>
                <Text style={[styles.detailValue, styles.messagePreview]}>
                  {body.length > 150 ? body.substring(0, 150) + '...' : body}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmDialog(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmSend}
                disabled={sending}
              >
                {sending ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Send Email</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.successModal]}>
            <Text style={styles.successTitle}>✅ Sent!</Text>
            <Text style={styles.successMessage}>Email sent successfully</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDesktop: {
    width: 600,
    alignSelf: 'center',
  },
  containerMobile: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 40,
  },
  headerContent: {
    flex: 1,
  },
  pageInfoContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  pageTitleMobile: {
    fontSize: 32,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  pageSubtitleMobile: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButtonsMobile: {
    gap: 8,
  },
  discardButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  discardButtonMobile: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  discardButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  discardButtonTextMobile: {
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  sendButtonMobile: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 4,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  sendButtonTextMobile: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputContainerMobile: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  bodyContainer: {
    flex: 1,
  },
  bodyContainerMobile: {
    flex: 1,
    minHeight: 200,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  labelMobile: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  inputMobile: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + '30',
    paddingVertical: 16,
    fontSize: 18,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    marginBottom: 4,
  },
  bodyInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  bodyInputMobile: {
    minHeight: 160,
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ccBccLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 12,
    marginLeft: 4,
  },
  ccBccLinkContainerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ccBccLinkMobile: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmationModal: {
    minWidth: 600,
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmationDetails: {
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  detailRow: {
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 20,
  },
  messagePreview: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  successModal: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    maxWidth: 300,
    minWidth: 250,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.success || '#22c55e',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
});