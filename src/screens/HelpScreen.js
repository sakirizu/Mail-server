import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { colors } from '../styles/theme';

const HelpScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Email Basics',
    'Phishing & Security', 
    'Profile Management',
    'Spam & Filters',
    'Storage & Performance'
  ];

  // FAQ data
  const faqData = [
    // Email Basics
    {
      id: 1,
      category: "Email Basics",
      question: "How do I send an email?",
      answer: "To send an email:\n1. Click the 'Compose' button\n2. Enter the recipient's email address\n3. Write the subject and message content\n4. Click the 'Send' button"
    },
    {
      id: 2,
      category: "Email Basics",
      question: "How do I attach files to my emails?",
      answer: "Attaching files:\n1. Click the 📎 icon while composing\n2. Select file type\n3. Find and select the desired file\n4. Send the message after file upload"
    },
    {
      id: 3,
      category: "Email Basics",
      question: "How do I mark messages as read/unread?",
      answer: "Marking messages:\n1. Select the desired message in the list\n2. Click the '✓' icon in the top menu\n3. Or open the message to automatically mark as read"
    },
    {
      id: 4,
      category: "Email Basics",
      question: "How do I save drafts?",
      answer: "Saving drafts:\n1. Click 'Save Draft' button while composing\n2. Or auto-save works every 30 seconds\n3. Find your drafts in the 'Drafts' section"
    },

    // Phishing & Security
    {
      id: 5,
      category: "Phishing & Security",
      question: "How does SMail detect phishing emails?",
      answer: "SMail uses advanced AI to detect phishing:\n• Analyzes sender reputation and patterns\n• Checks for suspicious links and attachments\n• Compares against known phishing databases\n• Warns you before opening suspicious emails\n• Automatically moves obvious phishing to spam"
    },
    {
      id: 6,
      category: "Phishing & Security",
      question: "What are the signs of a phishing email?",
      answer: "Watch out for these red flags:\n• Urgent threats or pressure to act quickly\n• Requests for personal or financial information\n• Suspicious sender addresses\n• Generic greetings like 'Dear Customer'\n• Poor grammar and spelling\n• Unexpected attachments or links\n• Mismatched URLs when hovering over links"
    },
    {
      id: 7,
      category: "Phishing & Security",
      question: "What should I do if I receive a phishing email?",
      answer: "If you suspect phishing:\n1. DO NOT click any links or download attachments\n2. DO NOT provide any personal information\n3. Mark the email as spam\n4. Report it using the 'Report Phishing' button\n5. Delete the email immediately\n6. If you already clicked, change your passwords immediately"
    },
    {
      id: 8,
      category: "Phishing & Security",
      question: "How can I verify if an email is legitimate?",
      answer: "To verify email legitimacy:\n• Check the sender's email address carefully\n• Look for official company domains\n• Verify through the company's official website\n• Contact the sender through a known phone number\n• Check for digital signatures or certificates\n• Be suspicious of unexpected emails requesting information"
    },
    {
      id: 9,
      category: "Phishing & Security",
      question: "How do I enable two-factor authentication?",
      answer: "Enable 2FA for better security:\n1. Go to Profile → Security Settings\n2. Click 'Enable Two-Factor Authentication'\n3. Choose SMS, authenticator app, or email\n4. Follow the setup instructions\n5. Save backup codes in a safe place\n6. Test the setup before finishing"
    },

    // Profile Management
    {
      id: 10,
      category: "Profile Management",
      question: "How do I change my profile information?",
      answer: "To update your profile:\n1. Click on your profile picture/name\n2. Select 'Edit Profile'\n3. Update your name, phone, or other details\n4. Upload a new profile picture if needed\n5. Click 'Save Changes'\n6. Verify any email changes through confirmation"
    },
    {
      id: 11,
      category: "Profile Management",
      question: "How can I change my password?",
      answer: "To change your password:\n1. Go to the Profile section\n2. Select 'Security' option\n3. Click 'Change Password' button\n4. Enter your current password\n5. Enter your new strong password twice\n6. Save the changes"
    },
    {
      id: 12,
      category: "Profile Management",
      question: "How do I delete my account permanently?",
      answer: "To delete your account:\n⚠️ WARNING: This action is irreversible!\n1. Go to Profile → Account Settings\n2. Scroll to 'Delete Account' section\n3. Read the warnings carefully\n4. Enter your password for confirmation\n5. Type 'DELETE' to confirm\n6. Click 'Permanently Delete Account'\n\nNote: All emails and data will be lost forever."
    },
    {
      id: 13,
      category: "Profile Management",
      question: "How do I temporarily deactivate my account?",
      answer: "To temporarily deactivate:\n1. Go to Profile → Account Settings\n2. Select 'Deactivate Account'\n3. Choose deactivation period (1 week to 6 months)\n4. Enter your password\n5. Confirm deactivation\n\nYour account will be reactivated when you log in again or after the period expires."
    },
    {
      id: 14,
      category: "Profile Management",
      question: "How do I export my email data?",
      answer: "To export your data:\n1. Go to Profile → Data & Privacy\n2. Click 'Export Data'\n3. Select what to export (emails, contacts, etc.)\n4. Choose file format (ZIP, PDF, etc.)\n5. Request export\n6. Download the file when ready (you'll receive an email notification)"
    },

    // Spam & Filters
    {
      id: 15,
      category: "Spam & Filters",
      question: "How do I manage spam messages?",
      answer: "Managing spam messages:\n1. Go to the Spam section\n2. Review flagged messages\n3. Use 'Not Spam' for false positives\n4. Delete confirmed spam messages\n5. The spam filter learns from your actions automatically"
    },
    {
      id: 16,
      category: "Spam & Filters",
      question: "How do I create email filters?",
      answer: "Creating email filters:\n1. Go to Settings → Filters & Rules\n2. Click 'Create New Filter'\n3. Set conditions (sender, subject, keywords)\n4. Choose actions (label, move, delete, etc.)\n5. Test the filter\n6. Save and activate"
    },

    // Storage & Performance
    {
      id: 17,
      category: "Storage & Performance",
      question: "What to do when mailbox is full?",
      answer: "Managing storage:\n1. Check space in Statistics section\n2. Delete unnecessary messages\n3. Clean large attachments\n4. Empty trash and spam folders\n5. Archive old emails\n6. Consider upgrading storage plan"
    },
    {
      id: 18,
      category: "Storage & Performance",
      question: "How do I configure notifications?",
      answer: "Configuring notifications:\n1. Go to Settings menu\n2. Select 'Notifications' section\n3. Turn on/off desired options\n4. Set notification sounds\n5. Configure notification frequency\n6. Save the changes"
    }
  ];

  // Filter FAQ based on search and category
  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderFAQItem = (item) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <View key={item.id} style={styles.faqItem}>
        <TouchableOpacity
          style={styles.questionContainer}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.questionText}>{item.question}</Text>
          <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        
        {expanded && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>{item.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  const handleContactSupport = () => {
    navigation.navigate('Support');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❓ Help</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search questions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Filter by Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScrollView}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipSelected
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🙋‍♀️ {selectedCategory === 'All' ? 'All Questions' : selectedCategory}
            {filteredFAQ.length > 0 && ` (${filteredFAQ.length})`}
          </Text>
          
          {filteredFAQ.map(item => renderFAQItem(item))}
          
          {filteredFAQ.length === 0 && searchQuery && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>Try searching with different keywords</Text>
            </View>
          )}
        </View>

        {/* Contact Support Button */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={handleContactSupport}
          activeOpacity={0.8}
        >
          <Text style={styles.supportIcon}>📞</Text>
          <Text style={styles.supportButtonText}>Contact Technical Support</Text>
          <Text style={styles.supportButtonSubtext}>Can't find your answer? Contact us</Text>
        </TouchableOpacity>

        {/* Additional Help Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>📚 Additional Resources</Text>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>📖</Text>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>User Manual</Text>
              <Text style={styles.resourceDesc}>Complete usage guide</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>🎥</Text>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Video Tutorials</Text>
              <Text style={styles.resourceDesc}>Step-by-step video lessons</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>💡</Text>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Tips and Tricks</Text>
              <Text style={styles.resourceDesc}>Tips for effective usage</Text>
            </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  searchIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  categoryScrollView: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: colors.white,
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
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 10,
  },
  expandIcon: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  answerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  answerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  supportButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#cc0000',
  },
  supportIcon: {
    fontSize: 30,
    marginBottom: 10,
    color: '#cc0000',
  },
  supportButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#cc0000',
    marginBottom: 5,
  },
  supportButtonSubtext: {
    fontSize: 14,
    color: '#cc0000',
    textAlign: 'center',
    opacity: 0.8,
  },
  resourcesSection: {
    marginBottom: 20,
  },
  resourceItem: {
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
  resourceIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  resourceText: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  resourceDesc: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default HelpScreen;