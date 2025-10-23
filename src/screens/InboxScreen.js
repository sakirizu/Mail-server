import React from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions, RefreshControl } from 'react-native';
import MailItem from '../components/MailItem';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function InboxScreen() {
  const [emails, setEmails] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 768;

  const loadEmailStats = async () => {
    try {
      if (!user || !user.token) return;

      const response = await fetch('http://localhost:3001/api/mails/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

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

      const response = await fetch('http://localhost:3001/api/mails/inbox', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

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
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadEmails(), loadEmailStats()]);
    setRefreshing(false);
  };

  const handleEmailRead = async (emailId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/mails/${emailId}/read`, {
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
        <View style={[styles.emptyContainer, isMobile && styles.emptyContainerMobile]}>
          <Text style={[styles.emptyTitle, isMobile && styles.emptyTitleMobile]}>📧</Text>
          <Text style={[styles.emptyText, isMobile && styles.emptyTextMobile]}>受信トレイにメールがありません</Text>
          <Text style={[styles.emptySubtext, isMobile && styles.emptySubtextMobile]}>
            メールを受信すると、ここに表示されます
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      isDesktop && styles.containerDesktop,
      isMobile && styles.containerMobile
    ]}>
      {/* Header with email count */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={styles.headerContent}>
          <View style={styles.inboxInfoContainer}>
            <Text style={[styles.pageTitle, isMobile && styles.pageTitleMobile]}>
              受信トレイ
            </Text>
            <Text style={[styles.inboxTitle, isMobile && styles.inboxTitleMobile]}>
              📧 {emails.length} 通
            </Text>
            {unreadCount > 0 && (
              <Text style={[styles.unreadInfo, isMobile && styles.unreadInfoMobile]}>
                {unreadCount} 件未読
              </Text>
            )}
          </View>
        </View>
      </View>
      
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
  unreadBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  inboxInfoContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  pageTitleMobile: {
    fontSize: 26,
    fontWeight: '800',
  },
  inboxTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 1,
  },
  inboxTitleMobile: {
    fontSize: 18,
    fontWeight: '600',
  },
  unreadInfo: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: '500',
  },
  unreadInfoMobile: {
    fontSize: 16,
    fontWeight: '600',
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