import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';

const UserGuideScreen = ({ navigation }) => {
  const guideTopics = [
    {
      id: 1,
      title: "Getting Started",
      icon: "🚀",
      description: "Learn the basics of using SMail",
      sections: [
        "Creating your account",
        "Setting up your profile",
        "First login and setup",
        "Understanding the interface"
      ]
    },
    {
      id: 2,
      title: "Sending & Receiving Emails",
      icon: "📧",
      description: "Master email communication",
      sections: [
        "Composing and sending emails",
        "Reading and managing inbox",
        "Using CC and BCC effectively",
        "Managing email attachments"
      ]
    },
    {
      id: 3,
      title: "Email Organization",
      icon: "📁",
      description: "Keep your emails organized",
      sections: [
        "Using folders and labels",
        "Sorting and filtering emails",
        "Managing drafts and sent items",
        "Archive and delete emails"
      ]
    },
    {
      id: 4,
      title: "Security & Privacy",
      icon: "🔒",
      description: "Protect your account and data",
      sections: [
        "Setting up two-factor authentication",
        "Recognizing phishing attempts",
        "Managing privacy settings",
        "Secure password practices"
      ]
    },
    {
      id: 5,
      title: "Advanced Features",
      icon: "⚡",
      description: "Maximize your productivity",
      sections: [
        "Email filters and rules",
        "Calendar integration",
        "Contact management",
        "Email signatures and templates"
      ]
    },
    {
      id: 6,
      title: "Mobile App Usage",
      icon: "📱",
      description: "Using SMail on your mobile device",
      sections: [
        "Mobile app setup",
        "Push notifications",
        "Offline email access",
        "Mobile-specific features"
      ]
    }
  ];

  const renderGuideSection = (topic) => (
    <TouchableOpacity
      key={topic.id}
      style={styles.topicCard}
      onPress={() => {
        // Navigate to detailed guide section
        // For now, just show an alert
        alert(`Opening ${topic.title} guide...`);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.topicIconContainer}>
        <Text style={styles.topicIcon}>{topic.icon}</Text>
      </View>
      <View style={styles.topicContent}>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        <Text style={styles.topicDescription}>{topic.description}</Text>
        <View style={styles.sectionsList}>
          {topic.sections.map((section, index) => (
            <Text key={index} style={styles.sectionItem}>• {section}</Text>
          ))}
        </View>
      </View>
      <Text style={styles.topicArrow}>→</Text>
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
        <Ionicons name="library" size={24} color={colors.text} style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>User Guide</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Welcome to SMail User Guide</Text>
          <Text style={styles.introText}>
            Learn how to use all features of SMail effectively. From basic email operations to advanced security features, this guide covers everything you need to know.
          </Text>
        </View>

        {/* Guide Topics */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="book" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Guide Topics</Text>
          </View>
          {guideTopics.map(topic => renderGuideSection(topic))}
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="bulb" size={20} color="#FFD60A" style={{ marginRight: 8 }} />
            <Text style={styles.tipsTitle}>Quick Tips</Text>
          </View>
          
          <View style={styles.tipCard}>
            <Ionicons name="keypad" size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Keyboard Shortcuts</Text>
              <Text style={styles.tipText}>• Ctrl+N: New email</Text>
              <Text style={styles.tipText}>• Ctrl+R: Reply</Text>
              <Text style={styles.tipText}>• Delete: Move to trash</Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="search" size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Search Tips</Text>
              <Text style={styles.tipText}>• Use quotes for exact phrases</Text>
              <Text style={styles.tipText}>• Search by sender: from:email@domain.com</Text>
              <Text style={styles.tipText}>• Search by date: after:2024/01/01</Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <Ionicons name="mail" size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Email Best Practices</Text>
              <Text style={styles.tipText}>• Use clear, descriptive subject lines</Text>
              <Text style={styles.tipText}>• Keep messages concise and organized</Text>
              <Text style={styles.tipText}>• Always verify recipients before sending</Text>
            </View>
          </View>
        </View>

        {/* Video Tutorials */}
        <View style={styles.videoSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="videocam" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Video Tutorials</Text>
          </View>
          
          <TouchableOpacity style={styles.videoCard}>
            <Ionicons name="play-circle" size={48} color={colors.primary} />
            <View style={styles.videoContent}>
              <Text style={styles.videoTitle}>Getting Started with SMail</Text>
              <Text style={styles.videoDescription}>5 min tutorial covering the basics</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.videoCard}>
            <Ionicons name="play-circle" size={48} color={colors.primary} />
            <View style={styles.videoContent}>
              <Text style={styles.videoTitle}>Advanced Email Management</Text>
              <Text style={styles.videoDescription}>Learn filters, labels, and organization</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.videoCard}>
            <Ionicons name="play-circle" size={48} color={colors.primary} />
            <View style={styles.videoContent}>
              <Text style={styles.videoTitle}>Security and Privacy Settings</Text>
              <Text style={styles.videoDescription}>Protect your account and data</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Need More Help */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need More Help?</Text>
          <View style={styles.helpButtons}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => navigation.navigate('Help')}
            >
              <Ionicons name="help-circle" size={32} color="#fff" />
              <Text style={styles.helpButtonText}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => navigation.navigate('Support')}
            >
              <Ionicons name="headset" size={32} color="#fff" />
              <Text style={styles.helpButtonText}>Support</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: colors.primary,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  introSection: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  introText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
  topicCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topicIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  topicIcon: {
    fontSize: 24,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  topicDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  sectionsList: {
    marginTop: 5,
  },
  sectionItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  topicArrow: {
    fontSize: 20,
    color: colors.textSecondary,
    marginLeft: 10,
    marginTop: 10,
  },
  tipsSection: {
    marginBottom: 25,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  tipCard: {
    flexDirection: 'row',
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
  tipIcon: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 5,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  tipText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  videoSection: {
    marginBottom: 25,
  },
  videoCard: {
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
  videoIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  videoContent: {
    flex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 3,
  },
  videoDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  helpSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  helpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  helpButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    minWidth: 100,
  },
  helpButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default UserGuideScreen;

