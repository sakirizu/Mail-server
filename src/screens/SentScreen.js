import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions, FlatList, RefreshControl, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MailItem from '../components/MailItem';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function SentScreen() {
  const [emails, setEmails] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 768;

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const loadEmails = async () => {
    try {
      if (!user || !user.token) {
        console.log('No user token available');
        setEmails([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/mails/sent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📤 Loaded sent emails:', data.mails?.length || 0);
        setEmails(data.mails || []);
      } else {
        console.error('Failed to load sent emails:', response.status);
        setEmails([]);
      }
    } catch (error) {
      console.error('Error loading sent emails:', error);
      setEmails([]);
    }
  };

  React.useEffect(() => {
    const loadInitialEmails = async () => {
      setLoading(true);
      await loadEmails();
      setLoading(false);
    };
    
    if (user) {
      loadInitialEmails();
      
      // Auto-refresh every 10 seconds
      const interval = setInterval(() => {
        loadEmails();
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
    await loadEmails();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => <MailItem mail={item} />;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isMobile && styles.loadingContainerMobile]}>
        <Text style={[styles.loadingText, isMobile && styles.loadingTextMobile]}>送信済みメールを読み込み中...</Text>
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
              <Ionicons name="paper-plane-outline" size={64} color="#fff" />
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.emptyText, isMobile && styles.emptyTextMobile]}>送信済みメールがありません</Text>
          <Text style={[styles.emptySubtext, isMobile && styles.emptySubtextMobile]}>
            送信したメールがここに表示されます
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
      <LinearGradient
        colors={['#007AFF', '#0051D5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isMobile && styles.headerMobile]}
      >
        <View style={styles.headerContent}>
          <View style={styles.inboxInfoContainer}>
            <View style={styles.titleRow}>
              <Ionicons name="paper-plane" size={28} color="#fff" />
              <Text style={[styles.pageTitle, isMobile && styles.pageTitleMobile]}>
                送信済み
              </Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statBadge}>
                <Ionicons name="mail" size={16} color="#fff" />
                <Text style={styles.statText}>{emails.length} 通</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
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
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    minHeight: 80,
  },
  headerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    minHeight: 80,
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
  statText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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
  listContainer: {
    flex: 1,
  },
  listContainerMobile: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingBottom: 32,
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
  emptyTitle: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitleMobile: {
    fontSize: 56,
    marginBottom: 20,
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