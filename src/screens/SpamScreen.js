import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const SpamScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [spamEmails, setSpamEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSpamEmails();
  }, []);

  const loadSpamEmails = async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/mails/spam`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Spam emails loaded:', data.mails?.length || 0);
        setSpamEmails(data.mails || []);
      } else {
        console.error('Failed to load spam emails:', response.status);
        setSpamEmails([]);
      }
    } catch (error) {
      console.error('Error loading spam emails:', error);
      setSpamEmails([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSpamEmails();
  };

  const handleDeleteSpam = async (emailId) => {
    Alert.alert(
      '迷惑メールを削除',
      'この迷惑メールを完全に削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/mails/${emailId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                  'Content-Type': 'application/json'
                }
              });

              if (response.ok) {
                setSpamEmails(prev => prev.filter(email => email.id !== emailId && email._id !== emailId));
                Alert.alert('成功', '迷惑メールを削除しました');
              } else {
                Alert.alert('エラー', '削除に失敗しました');
              }
            } catch (error) {
              console.error('Error deleting spam:', error);
              Alert.alert('エラー', '削除に失敗しました');
            }
          }
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ただ今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const renderSpamItem = ({ item }) => (
    <View style={styles.emailItem}>
      <View style={styles.emailHeader}>
        <View style={styles.senderInfo}>
          <Text style={styles.sender} numberOfLines={1}>{item.from || item.sender || '不明'}</Text>
        </View>
        <Text style={styles.timestamp}>{formatDate(item.receivedAt || item.date)}</Text>
      </View>
      <Text style={styles.subject} numberOfLines={1}>{item.subject || '(件名なし)'}</Text>
      <Text style={styles.preview} numberOfLines={2}>{item.snippet || item.body || ''}</Text>
      <View style={styles.spamActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteSpam(item.id || item._id)}
        >
          <Text style={styles.deleteText}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.inboxInfoContainer}>
            <Text style={styles.pageTitle}>
              迷惑メール
            </Text>
            <Text style={styles.inboxTitle}>
              🚫 {spamEmails.length} 通
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="warning" size={16} color="#FF9500" style={{ marginRight: 4 }} />
              <Text style={styles.warningInfo}>これらのメールは有害な可能性があります</Text>
            </View>
          </View>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : spamEmails.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-checkmark" size={64} color="#34C759" />
          <Text style={styles.emptyText}>迷惑メールはありません</Text>
        </View>
      ) : (
        <FlatList
          data={spamEmails}
          renderItem={renderSpamItem}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={styles.emailList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearAllButton}>
          <Text style={styles.clearAllText}>すべての迷惑メールをクリア</Text>
        </TouchableOpacity>
      </View>
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
  warningInfo: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '500',
  },
  emailList: {
    padding: 16,
    paddingBottom: 80,
  },
  emailItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffcccb',
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.8,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  senderInfo: {
    flex: 1,
    marginRight: 8,
  },
  sender: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: '500',
    marginBottom: 4,
  },
  phishingBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  phishingText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  subject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  preview: {
    fontSize: 14,
    color: '#888888',
    lineHeight: 20,
    marginBottom: 12,
  },
  spamActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 70,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  clearAllButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 140,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default SpamScreen;


