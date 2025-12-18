import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

const NotificationModal = ({ visible, onClose, type, title, message }) => {
  const isSuccess = type === 'success';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, isSuccess ? styles.successModal : styles.errorModal]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>
              {isSuccess ? '✅' : '❌'}
            </Text>
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, isSuccess ? styles.successTitle : styles.errorTitle]}>
              {title}
            </Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          {/* Button */}
          <TouchableOpacity 
            style={[styles.button, isSuccess ? styles.successButton : styles.errorButton]} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
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
    borderRadius: 20,
    padding: 30,
    minWidth: 300,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  successModal: {
    borderTopWidth: 4,
    borderTopColor: '#4CAF50',
  },
  errorModal: {
    borderTopWidth: 4,
    borderTopColor: '#f44336',
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
  },
  content: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  successTitle: {
    color: '#4CAF50',
  },
  errorTitle: {
    color: '#f44336',
  },
  message: {
    fontSize: 16,
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationModal;

