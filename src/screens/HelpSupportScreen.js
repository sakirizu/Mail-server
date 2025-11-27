import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';

const HelpSupportScreen = ({ navigation }) => {
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
        <Ionicons name="help-circle" size={24} color={colors.text} style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What help do you need?</Text>
          
          {/* User Guide Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('UserGuide')}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIconContainer, styles.guideIconContainer]}>
              <Ionicons name="library" size={32} color={colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>User Guide</Text>
              <Text style={styles.optionDescription}>
                Complete guide on how to use SMail effectively
              </Text>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>• Getting started tutorials</Text>
                <Text style={styles.featureItem}>• Email management tips</Text>
                <Text style={styles.featureItem}>• Security best practices</Text>
                <Text style={styles.featureItem}>• Video tutorials</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Help Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('Help')}
            activeOpacity={0.8}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="help-circle" size={32} color={colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Help & FAQ</Text>
              <Text style={styles.optionDescription}>
                Find answers to common problems and questions
              </Text>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>• Frequently asked questions</Text>
                <Text style={styles.featureItem}>• Phishing detection help</Text>
                <Text style={styles.featureItem}>• Profile management</Text>
                <Text style={styles.featureItem}>• Security troubleshooting</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Support Option */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('Support')}
            activeOpacity={0.8}
          >
            <View style={[styles.optionIconContainer, styles.supportIconContainer]}>
              <Text style={styles.optionIcon}>🎧</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Technical Support</Text>
              <Text style={styles.optionDescription}>
                Direct contact with our support team for technical issues
              </Text>
              <View style={styles.featuresList}>
                <Text style={styles.featureItem}>• Contact via Telegram and WhatsApp</Text>
                <Text style={styles.featureItem}>• Email and phone support</Text>
                <Text style={styles.featureItem}>• Submit help requests</Text>
                <Text style={styles.featureItem}>• Office addresses</Text>
              </View>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('UserGuide')}
            >
              <Text style={styles.quickActionIcon}>�</Text>
              <Text style={styles.quickActionText}>User Guide</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Help')}
            >
              <Text style={styles.quickActionIcon}>�</Text>
              <Text style={styles.quickActionText}>Search FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Support')}
            >
              <Text style={styles.quickActionIcon}>�</Text>
              <Text style={styles.quickActionText}>Contact Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('Support')}
            >
              <Text style={styles.quickActionIcon}>�</Text>
              <Text style={styles.quickActionText}>Submit Request</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.emergencySection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="alert-circle" size={24} color="#FF3B30" style={{ marginRight: 8 }} />
            <Text style={styles.emergencyTitle}>Emergency Help</Text>
          </View>
          <Text style={styles.emergencyText}>
            If you have urgent technical issues, call us immediately:
          </Text>
          <TouchableOpacity style={styles.emergencyButton}>
            <Ionicons name="call" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.emergencyButtonText}>+81-000-0000-0000</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  supportIconContainer: {
    backgroundColor: colors.secondary + '20',
  },
  guideIconContainer: {
    backgroundColor: colors.success + '20',
  },
  optionIcon: {
    fontSize: 30,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  featuresList: {
    marginTop: 5,
  },
  featureItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  optionArrow: {
    fontSize: 24,
    color: colors.textSecondary,
    marginLeft: 10,
    marginTop: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emergencySection: {
    backgroundColor: 'rgba(204, 0, 0, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: colors.secondary,
    lineHeight: 20,
    marginBottom: 15,
  },
  emergencyButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

export default HelpSupportScreen;