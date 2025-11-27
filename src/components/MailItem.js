import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
      activeOpacity={0.7}
      android_ripple={{ color: '#007AFF15', borderless: false }}
    >
      {/* Unread indicator gradient */}
      {!mail.read_status && (
        <LinearGradient
          colors={['#007AFF', '#0051D5']}
          style={styles.unreadIndicator}
        />
      )}
      
      <View style={[styles.leftSection, isMobile && styles.leftSectionMobile]}>
        <LinearGradient
          colors={
            !mail.read_status 
              ? ['#007AFF', '#0051D5'] 
              : ['#8E8E93', '#C7C7CC']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.avatar, isMobile && styles.avatarMobile]}
        >
          <Text style={[styles.avatarText, isMobile && styles.avatarTextMobile]}>
            {mail.sender?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </LinearGradient>
      </View>
      
      <View style={[styles.contentSection, isMobile && styles.contentSectionMobile]}>
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <View style={styles.senderContainer}>
            <Text style={[styles.sender, isMobile && styles.senderMobile, !mail.read_status && styles.senderUnread]} numberOfLines={1}>
              {mail.sender}
            </Text>
            {!mail.read_status && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>NEW</Text>
              </View>
            )}
          </View>
          <View style={styles.timeContainer}>
            <Ionicons 
              name="time-outline" 
              size={14} 
              color="#8E8E93" 
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.time, isMobile && styles.timeMobile]}>
              {formatTimeAgo(mail.created_at || mail.date)}
            </Text>
          </View>
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
    backgroundColor: colors.surface,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  containerDesktop: {
    borderRadius: 8,
    marginHorizontal: 0,
    elevation: 1,
  },
  containerMobile: {
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 16,
    elevation: 3,
    shadowOpacity: 0.1,
    minHeight: 100,
    backgroundColor: colors.androidSurface,
  },
  unread: {
    backgroundColor: '#F8F9FF',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  leftSection: {
    marginRight: 16,
    justifyContent: 'center',
  },
  leftSectionMobile: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMobile: {
    width: 52,
    height: 52,
    borderRadius: 26,
    elevation: 2,
  },
  avatarText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  avatarTextMobile: {
    fontSize: 20,
    fontWeight: '700',
  },
  contentSection: {
    flex: 1,
  },
  contentSectionMobile: {
    flex: 1,
    minHeight: 68,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerMobile: {
    marginBottom: 8,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  sender: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  senderMobile: {
    fontSize: 16,
    fontWeight: '600',
  },
  senderUnread: {
    fontWeight: '700',
    color: '#1D1D1F',
  },
  newBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '500',
  },
  timeMobile: {
    fontSize: 13,
  },
  subject: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  subjectMobile: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  subjectUnread: {
    fontWeight: '700',
    color: '#1D1D1F',
  },
  snippet: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 18,
  },
  snippetMobile: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8E8E93',
  },
});

export default MailItem;