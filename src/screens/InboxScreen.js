import React from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions, RefreshControl, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MailItem from '../components/MailItem';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function InboxScreen() {
  const [emails, setEmails] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 768;

  // Animation values for empty state
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const loadEmailStats = async () => {
    try {
      if (!user || !user.token) return;

      const response = await fetch(`${API_BASE_URL}/api/mails/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.log('Token expired, please login again');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.statistics?.unread_count || 0);
      }
    } catch (error) {
      console.error('Error loading email stats:', error);
    }
  };

  const loadEmails = async () => {
    try {
      if (!user || !user.token) {
        console.log('No user token available');
        setEmails([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/mails/inbox`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        console.log('⚠️ Token expired or invalid. Please logout and login again.');
        setEmails([]);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('📧 Loaded emails:', data.mails?.length || 0);
        setEmails(data.mails || []);
        
        // Calculate unread count from loaded emails (only for inbox emails)
        const inboxEmails = (data.mails || []).filter(email => email.folder === 'inbox');
        const unreadEmails = inboxEmails.filter(email => !email.read_status);
        setUnreadCount(unreadEmails.length);
      } else {
        console.error('Failed to load emails:', response.status);
        setEmails([]);
      }
    } catch (error) {
      console.error('Error loading emails:', error);
      setEmails([]);
    }
  };

  React.useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([loadEmails(), loadEmailStats()]);
      setLoading(false);
    };
    
    if (user) {
      loadInitialData();
      
      // Auto-refresh every 10 seconds
      const interval = setInterval(() => {
        loadEmails();
        loadEmailStats();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Animate empty state
  React.useEffect(() => {
    if (!loading && (!emails || emails.length === 0)) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading, emails]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadEmails(), loadEmailStats()]);
    setRefreshing(false);
  };

  const handleEmailRead = async (emailId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mails/${emailId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state immediately to prevent re-marking as unread on reload
        setEmails(prev => prev.map(email => 
          email.id === emailId || email._id === emailId 
            ? { ...email, read_status: true }
            : email
        ));
        
        // Update unread count only if email was previously unread
        const emailToUpdate = emails.find(email => 
          (email.id === emailId || email._id === emailId) && !email.read_status
        );
        if (emailToUpdate) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  };

  const renderItem = ({ item }) => (
    <MailItem 
      mail={item} 
      onRead={() => !item.read_status && handleEmailRead(item.id || item._id)}
    />
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isMobile && styles.loadingContainerMobile]}>
        <Text style={[styles.loadingText, isMobile && styles.loadingTextMobile]}>メールを読み込み中...</Text>
      </View>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <View style={[styles.container, isMobile && styles.containerMobile]}>
        <Animated.View 
          style={[
            styles.emptyContainer, 
            isMobile && styles.emptyContainerMobile,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient
              colors={['#007AFF', '#0051D5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="mail-outline" size={64} color="#fff" />
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.emptyText, isMobile && styles.emptyTextMobile]}>受信トレイにメールがありません</Text>
          <Text style={[styles.emptySubtext, isMobile && styles.emptySubtextMobile]}>
            メールを受信すると、ここに表示されます
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      isDesktop && styles.containerDesktop,
      isMobile && styles.containerMobile
    ]}>
      {/* Modern Header with gradient */}
      <LinearGradient
        colors={['#007AFF', '#0051D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isMobile && styles.headerMobile]}
      >
        <View style={styles.headerContent}>
          <View style={styles.inboxInfoContainer}>
            <View style={styles.titleRow}>
              <Ionicons name="mail-unread" size={28} color="#fff" />
              <Text style={[styles.pageTitle, isMobile && styles.pageTitleMobile]}>
                受信トレイ
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Ionicons name="mail" size={16} color="#fff" />
                <Text style={styles.statText}>{emails.length} 通</Text>
              </View>
              {unreadCount > 0 && (
                <View style={[styles.statBadge, styles.unreadBadge]}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={[styles.statText, styles.unreadText]}>{unreadCount} 件未読</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
      
      {/* Mail list */}
      <View style={[styles.listContainer, isMobile && styles.listContainerMobile]}>
        <FlatList
          data={emails}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString() || item._id?.toString()}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={[styles.listContent, isMobile && styles.listContentMobile]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={8}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDesktop: {
    width: '100%',
    alignSelf: 'center',
  },
  containerMobile: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 2,
    minHeight: 40,
  },
  headerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0,
    backgroundColor: colors.surface,
    elevation: 4,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    minHeight: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  inboxInfoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  pageTitleMobile: {
    fontSize: 22,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  unreadBadge: {
    backgroundColor: '#fff',
  },
  statText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  unreadText: {
    color: '#FF3B30',
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.text,
  },
  count: {
    fontSize: 14,
    color: colors.placeholder,
    fontWeight: '400',
  },
  countMobile: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.5,
  },
  listContainer: {
    flex: 1,
  },
  listContainerMobile: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  listContentMobile: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    paddingBottom: 32,      // Extra bottom padding for Android
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingContainerMobile: {
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.placeholder,
  },
  loadingTextMobile: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContainerMobile: {
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyTextMobile: {
    fontSize: 20,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.placeholder,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptySubtextMobile: {
    fontSize: 16,
    lineHeight: 24,
  },
});

