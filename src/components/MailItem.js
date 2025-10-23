import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../styles/theme';

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  // For older than 4 weeks, show the actual date
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: diffInDays > 365 ? 'numeric' : undefined
  });
};

const MailItem = ({ mail, onPress, onRead }) => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 768;
  
  const handlePress = () => {
    // Mark as read when email is opened
    if (onRead && !mail.read_status) {
      onRead();
    }
    
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('MailDetail', { mail });
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isDesktop && styles.containerDesktop,
        isMobile && styles.containerMobile,
        !mail.read_status && styles.unread
      ]} 
      onPress={handlePress}
      activeOpacity={0.6}
      android_ripple={{ color: colors.primary + '15', borderless: false }}
    >
      <View style={[styles.leftSection, isMobile && styles.leftSectionMobile]}>
        <View style={[styles.avatar, isMobile && styles.avatarMobile]}>
          <Text style={[styles.avatarText, isMobile && styles.avatarTextMobile]}>
            {mail.sender?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
      </View>
      <View style={[styles.contentSection, isMobile && styles.contentSectionMobile]}>
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <View style={styles.senderContainer}>
            <Text style={[styles.sender, isMobile && styles.senderMobile, !mail.read_status && styles.senderUnread]} numberOfLines={1}>
              {mail.sender}
            </Text>
          </View>
          <Text style={[styles.time, isMobile && styles.timeMobile]}>
            {formatTimeAgo(mail.created_at || mail.date)}
          </Text>
        </View>
        <Text style={[styles.subject, isMobile && styles.subjectMobile, !mail.read_status && styles.subjectUnread]} numberOfLines={1}>
          {mail.subject}
        </Text>
        <Text style={[styles.snippet, isMobile && styles.snippetMobile]} numberOfLines={2}>
          {mail.snippet || mail.body || "No preview available"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: colors.surface,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerDesktop: {
    borderRadius: 0,
    marginHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  containerMobile: {
    padding: 20,
    marginHorizontal: 8,    // Reduced margin for better screen usage
    marginVertical: 4,
    borderRadius: 16,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderBottomWidth: 0,
    minHeight: 96,          // Increased height for better touch targets
    backgroundColor: colors.androidSurface,
  },
  leftSection: {
    marginRight: 16,
    justifyContent: 'center',
  },
  leftSectionMobile: {
    marginRight: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMobile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    elevation: 2,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarTextMobile: {
    fontSize: 18,
    fontWeight: '600',
  },
  contentSection: {
    flex: 1,
  },
  contentSectionMobile: {
    flex: 1,
    minHeight: 64,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerMobile: {
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  subject: {
    fontWeight: 'bold',
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  subjectMobile: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  sender: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  senderMobile: {
    fontSize: 16,
    fontWeight: '500',
  },
  time: {
    color: colors.placeholder,
    fontSize: 12,
  },
  timeMobile: {
    fontSize: 14,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  snippet: {
    color: colors.placeholder,
    fontSize: 14,
    lineHeight: 18,
  },
  snippetMobile: {
    fontSize: 15,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  unread: {
    backgroundColor: 'rgba(0, 0, 204, 0.05)', // Very light blue background for unread emails
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  senderUnread: {
    fontWeight: '700',
    color: colors.text,
  },
  subjectUnread: {
    fontWeight: '700',
    color: colors.text,
  },

});

export default MailItem;