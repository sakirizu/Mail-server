import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';

const SupportScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const contactMethods = [
    {
      id: 'email',
      title: 'Via Email',
      subtitle: 'support@smail.com',
      icon: '✉️',
      description: 'We respond within 24 hours',
      action: () => {
        Linking.openURL('mailto:support@smail.com?subject=Help Request');
      }
    },
    {
      id: 'phone',
      title: 'Via Phone',
      subtitle: '+81 000-0000-0000',
      icon: '📞',
      description: 'Mon-Fri: 9:00-18:00',
      action: () => {
        Linking.openURL('tel:+8100000000000');
      }
    },
    {
      id: 'telegram',
      title: 'Telegram',
      subtitle: '@smail_support',
      icon: '💬',
      description: 'For quick responses',
      action: () => {
        Linking.openURL('https://t.me/smail_support');
      }
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: '+81 000-0000-0000',
      icon: '📱',
      description: 'Daily 24/7',
      action: () => {
        Linking.openURL('https://wa.me/8100000000000');
      }
    }
  ];

  // Emergency Contact - Only for Cyber Attacks
  const emergencyContact = {
    id: 'emergency',
    title: 'FAVQULOTA QONGIROQ',
    subtitle: '+998 90 123-45-67',
    icon: '🚨',
    description: 'FAQAT KIBER XUJUMGA UCHRAGANDAGINA QONGIROQ QILING!',
    action: () => {
      Alert.alert(
        '🚨 FAVQULOTA QONGIROQ',
        'Bu raqam faqat kiber xujumga uchragandagina ishlatilishi kerak!\n\nDavom etasizmi?',
        [
          { text: 'Bekor qilish', style: 'cancel' },
          { 
            text: 'Ha, qongiroq qilaman', 
            style: 'destructive',
            onPress: () => Linking.openURL('tel:+998901234567')
          }
        ]
      );
    }
  };

  const categories = [
    { id: 'login', title: 'Login Issues', icon: '🔐' },
    { id: 'email', title: 'Sending/Receiving Emails', icon: '📧' },
    { id: 'spam', title: 'Spam and Security', icon: '🛡️' },
    { id: 'settings', title: 'Settings', icon: '⚙️' },
    { id: 'technical', title: 'Technical Issues', icon: '🔧' },
    { id: 'other', title: 'Other', icon: '❓' }
  ];

  const officeInfo = [
    {
      title: 'Main Office',
      address: 'Tokyo, Hachioji',
      phone: '+81 000-0000-0000',
      workTime: 'Mon-Fri: 9:00-18:00, Sat: 9:00-14:00',
      icon: '🏢'
    },
    {
      title: 'Technical Support Center',
      address: 'Tokyo, Hachioji',
      phone: '+81 000-0000-0000',
      workTime: '24/7',
      icon: '🛠️'
    }
  ];

  const handleSubmitTicket = () => {
    if (!name.trim() || !email.trim() || !message.trim() || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Here you would typically send the support ticket to your backend
    Alert.alert(
      'Success!',
      'Your request has been submitted. We will respond soon.',
      [
        {
          text: 'OK',
          onPress: () => {
            setName('');
            setEmail('');
            setMessage('');
            setSelectedCategory('');
          }
        }
      ]
    );
  };

  const renderContactMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={styles.contactCard}
      onPress={method.action}
      activeOpacity={0.8}
    >
      <View style={styles.contactIconContainer}>
        <Text style={styles.contactIcon}>{method.icon}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactTitle}>{method.title}</Text>
        <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
        <Text style={styles.contactDescription}>{method.description}</Text>
      </View>
      <Text style={styles.contactArrow}>→</Text>
    </TouchableOpacity>
  );

  const renderEmergencyContact = (method) => (
    <TouchableOpacity
      key={method.id}
      style={styles.emergencyCard}
      onPress={method.action}
      activeOpacity={0.8}
    >
      <View style={styles.emergencyIconContainer}>
        <Text style={styles.emergencyIcon}>{method.icon}</Text>
      </View>
      <View style={styles.emergencyInfo}>
        <Text style={styles.emergencyTitle}>{method.title}</Text>
        <Text style={styles.emergencySubtitle}>{method.subtitle}</Text>
        <Text style={styles.emergencyDescription}>{method.description}</Text>
      </View>
      <Text style={styles.emergencyArrow}>→</Text>
    </TouchableOpacity>
  );

  const renderCategory = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryItem,
        selectedCategory === category.id && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(category.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={[
        styles.categoryText,
        selectedCategory === category.id && styles.categoryTextSelected
      ]}>
        {category.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎧 Technical Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Contact Methods */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="call" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Quick Contact</Text>
          </View>
          {contactMethods.map(method => renderContactMethod(method))}
        </View>

        {/* Emergency Contact - Red Background */}
        <View style={styles.emergencySection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="alert-circle" size={22} color="#FF3B30" style={{ marginRight: 8 }} />
            <Text style={styles.emergencySectionTitle}>FAVQULOTA ALOQA</Text>
          </View>
          {renderEmergencyContact(emergencyContact)}
        </View>

        {/* Support Ticket Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Submit Support Request</Text>
          
          {/* Category Selection */}
          <Text style={styles.fieldLabel}>Issue Type:</Text>
          <View style={styles.categoriesContainer}>
            {categories.map(category => renderCategory(category))}
          </View>

          {/* Name Input */}
          <Text style={styles.fieldLabel}>Full Name:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textSecondary}
          />

          {/* Email Input */}
          <Text style={styles.fieldLabel}>Email Address:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={colors.textSecondary}
          />

          {/* Message Input */}
          <Text style={styles.fieldLabel}>Message:</Text>
          <TextInput
            style={[styles.textInput, styles.messageInput]}
            placeholder="Describe your issue in detail..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholderTextColor={colors.textSecondary}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitTicket}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit Request</Text>
          </TouchableOpacity>
        </View>

        {/* Office Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 Office Information</Text>
          {officeInfo.map((office, index) => (
            <View key={index} style={styles.officeCard}>
              <View style={styles.officeHeader}>
                <Text style={styles.officeIcon}>{office.icon}</Text>
                <Text style={styles.officeTitle}>{office.title}</Text>
              </View>
              <Text style={styles.officeAddress}>{office.address}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="call" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.officePhone}>{office.phone}</Text>
              </View>
              <Text style={styles.officeTime}>🕒 {office.workTime}</Text>
            </View>
          ))}
        </View>

        {/* FAQ Link */}
        <TouchableOpacity
          style={styles.faqButton}
          onPress={() => navigation.navigate('Help')}
          activeOpacity={0.8}
        >
          <Ionicons name="help-circle" size={24} color={colors.primary} style={{ marginRight: 12 }} />
          <View style={styles.faqTextContainer}>
            <Text style={styles.faqButtonText}>Frequently Asked Questions</Text>
            <Text style={styles.faqButtonSubtext}>Check FAQ section for quick answers</Text>
          </View>
          <Text style={styles.faqArrow}>→</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoTitle}>App Information</Text>
          <Text style={styles.appInfoText}>Version: 1.0.0</Text>
          <Text style={styles.appInfoText}>Last Update: 30.09.2025</Text>
          <Text style={styles.appInfoText}>Developer: Mail App Team</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#cc0000',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: '#cc0000',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#cc0000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactIcon: {
    fontSize: 24,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  contactArrow: {
    fontSize: 20,
    color: colors.textSecondary,
    marginLeft: 10,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  categoryTextSelected: {
    color: colors.white,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  messageInput: {
    height: 100,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  officeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  officeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  officeIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  officeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  officeAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
    lineHeight: 20,
  },
  officePhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  officeTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  faqButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  faqIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  faqTextContainer: {
    flex: 1,
  },
  faqButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 2,
  },
  faqButtonSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  faqArrow: {
    fontSize: 20,
    color: colors.primary,
    marginLeft: 10,
  },
  appInfoSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  appInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  // Emergency Section Styles
  emergencySection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#cc0000',
  },
  emergencySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 15,
    textAlign: 'center',
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#cc0000',
    shadowColor: '#cc0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#cc0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  emergencyIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 3,
  },
  emergencySubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 3,
  },
  emergencyDescription: {
    fontSize: 12,
    color: '#cc0000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emergencyArrow: {
    fontSize: 18,
    color: '#cc0000',
    fontWeight: 'bold',
  },
});

export default SupportScreen;

