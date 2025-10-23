import React from 'react';
import { StyleSheet, View, Text, useWindowDimensions, FlatList, RefreshControl } from 'react-native';
import MailItem from '../components/MailItem';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export default function SentScreen() {
  const [emails, setEmails] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 768;

  const loadEmails = async () => {
    try {
      if (!user || !user.token) {
        console.log('No user token available');
        setEmails([]);
        return;
      }

      const response = await fetch('http://localhost:3001/api/mails/sent', {
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
    }
  }, [user]);

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
        <View style={[styles.emptyContainer, isMobile && styles.emptyContainerMobile]}>
          <Text style={[styles.emptyTitle, isMobile && styles.emptyTitleMobile]}>📤</Text>
          <Text style={[styles.emptyText, isMobile && styles.emptyTextMobile]}>送信済みメールがありません</Text>
          <Text style={[styles.emptySubtext, isMobile && styles.emptySubtextMobile]}>
            送信したメールがここに表示されます
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
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View style={styles.headerContent}>
          <View style={styles.inboxInfoContainer}>
            <Text style={[styles.pageTitle, isMobile && styles.pageTitleMobile]}>
              送信済み
            </Text>
            <Text style={[styles.inboxTitle, isMobile && styles.inboxTitleMobile]}>
              📤 {emails.length} mails
            </Text>
          </View>
        </View>
      </View>
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