import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';

const ConfirmModal = ({ visible, onClose, onConfirm, title, message, preview }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.message}>{message}</Text>
            
            {/* Email Preview */}
            {preview && (
              <View style={styles.preview}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="mail" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.previewTitle}>メールプレビュー:</Text>
                </View>
                
                <View style={styles.previewField}>
                  <Text style={styles.fieldLabel}>宛先:</Text>
                  <Text style={styles.fieldValue}>
                    {Array.isArray(preview.to) ? preview.to.join(', ') : preview.to}
                  </Text>
                </View>
                
                {preview.cc && preview.cc.length > 0 && (
                  <View style={styles.previewField}>
                    <Text style={styles.fieldLabel}>CC:</Text>
                    <Text style={styles.fieldValue}>
                      {Array.isArray(preview.cc) ? preview.cc.join(', ') : preview.cc}
                    </Text>
                  </View>
                )}
                
                {preview.bcc && preview.bcc.length > 0 && (
                  <View style={styles.previewField}>
                    <Text style={styles.fieldLabel}>BCC:</Text>
                    <Text style={styles.fieldValue}>
                      {Array.isArray(preview.bcc) ? preview.bcc.join(', ') : preview.bcc}
                    </Text>
                  </View>
                )}
                
                <View style={styles.previewField}>
                  <Text style={styles.fieldLabel}>件名:</Text>
                  <Text style={styles.fieldValue}>{preview.subject}</Text>
                </View>
                
                <View style={styles.previewField}>
                  <Text style={styles.fieldLabel}>メッセージ:</Text>
                  <Text style={styles.fieldValue} numberOfLines={3}>
                    {preview.body}
                  </Text>
                </View>
              </View>
            )}
          </View>
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Ionicons name="close-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.confirmButtonText}>メールを送信</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    minWidth: 400,
    maxWidth: 600,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.onPrimary,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: colors.onSurface,
    marginBottom: 15,
    textAlign: 'center',
  },
  preview: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  previewField: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.onSurface,
    width: 80,
    marginRight: 10,
  },
  fieldValue: {
    fontSize: 14,
    color: colors.onSurface,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurfaceVariant,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onPrimary,
  },
});

export default ConfirmModal;

