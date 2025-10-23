import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const DraftsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/mails/drafts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDrafts(data.mails || []);
      } else {
        console.error('Failed to load drafts');
        setDrafts([]);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
      setDrafts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDrafts();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderDraftItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.emailItem} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Compose', {
        to: Array.isArray(item.to) ? item.to.join(', ') : item.to,
        subject: item.subject,
        body: item.body
      })}
    >
      <View style={styles.emailHeader}>
        <Text style={styles.recipient} numberOfLines={1}>
          To: {Array.isArray(item.to) ? item.to.join(', ') : item.to || '(No recipient)'}
        </Text>
        <Text style={styles.timestamp}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.subject} numberOfLines={1}>
        {item.subject || '(No Subject)'}
      </Text>
      <Text style={styles.preview} numberOfLines={2}>
        {item.body || '(No content)'}
      </Text>
      <View style={styles.draftActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Compose', {
            to: Array.isArray(item.to) ? item.to.join(', ') : item.to,
            subject: item.subject,
            body: item.body
          })}
        >
          <Text style={styles.actionText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
          <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.inboxInfoContainer}>
            <Text style={styles.pageTitle}>
              下書き
            </Text>
            <Text style={styles.inboxTitle}>
              📄 {drafts.length} 件
            </Text>
          </View>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>下書きを読み込み中...</Text>
        </View>
      ) : drafts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>下書きがありません</Text>
          <Text style={styles.emptySubtext}>未送信のメールがここに表示されます</Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          renderItem={renderDraftItem}
          keyExtractor={(item) => item._id || item.id}
          style={styles.emailList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
  inboxTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 1,
  },
  emailList: {
    padding: 16,
  },
  emailItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipient: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  subject: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  preview: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  draftActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primary,
    minWidth: 70,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.secondary,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteText: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default DraftsScreen;
