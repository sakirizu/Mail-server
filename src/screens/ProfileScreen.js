import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const API_URL = 'http://localhost:3001/api/profile';

const ProfileScreen = ({ navigation }) => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [stats, setStats] = useState({ total: 0, unread: 0, storage: '0 MB' });

  // Responsive calculations
  const { width, height } = screenData;
  const isTablet = width >= 768;
  const isSmallPhone = width < 375;
  const isAndroid = Platform.OS === 'android';

  // Listen for orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    
    return () => subscription?.remove();
  }, []);

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        // Use current user data from AuthContext
        if (user) {
          const userProfile = {
            name: user.name || user.username || 'User',
            email: user.email || `${user.username}@ssmail.com`
          };
          
          // Simulate loading delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          setProfile(userProfile);
          setName(userProfile.name);
        } else {
          // Fallback if no user
          const fallbackProfile = {
            name: 'User',
            email: 'user@ssmail.com'
          };
          setProfile(fallbackProfile);
          setName(fallbackProfile.name);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Load stats from API
  useEffect(() => {
    const loadStats = async () => {
      if (!user || !user.token) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/mails/stats`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const storageGB = ((data.statistics?.total_size || 0) / (1024 * 1024 * 1024)).toFixed(1);
          setStats({
            total: data.statistics?.total_count || 0,
            unread: data.statistics?.unread_count || 0,
            storage: storageGB + 'GB'
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, [user]);

  // Load stats from API
  useEffect(() => {
    const loadStats = async () => {
      if (!user || !user.token) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/mails/stats`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const storageGB = ((data.statistics?.total_size || 0) / (1024 * 1024 * 1024)).toFixed(1);
          setStats({
            total: data.statistics?.total_count || 0,
            unread: data.statistics?.unread_count || 0,
            storage: storageGB + 'GB'
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    
    loadStats();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Update profile with new name
      const updatedProfile = { ...profile, name };
      setProfile(updatedProfile);
      setEditing(false);
      
      // Update user in AuthContext
      if (login) {
        login({ ...user, name });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // Navigate back to inbox instead of login for now
    navigation?.navigate('Inbox');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>プロフィール</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>プロフィールを読み込み中...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>プロフィール</Text>
        </View>
        <View style={styles.center}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="warning" size={24} color="#FF3B30" style={{ marginRight: 8 }} />
            <Text style={styles.error}>{error}</Text>
          </View>
          <TouchableOpacity style={styles.retryBtn} onPress={() => window.location.reload()}>
            <Ionicons name="sync" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.retryBtnText}>再試行</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back button header */}
      <View style={[
        styles.headerBar,
        isSmallPhone && { paddingHorizontal: 12, paddingVertical: 12 }
      ]}>
        <TouchableOpacity 
          style={[
            styles.backButton,
            isSmallPhone && { width: 36, height: 36, borderRadius: 18, marginRight: 12 }
          ]}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.backIcon,
            isSmallPhone && { fontSize: 16 }
          ]}>←</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          isSmallPhone && { fontSize: 18 }
        ]}>プロフィール</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Account Overview */}
        <View style={[
          styles.accountOverview,
          isTablet && styles.accountOverviewTablet,
          isSmallPhone && styles.accountOverviewSmall
        ]}>
          <View style={[
            styles.accountHeader,
            isSmallPhone && styles.accountHeaderSmall
          ]}>
            <View style={styles.avatarContainer}>
              <View style={[
                styles.avatarCircle,
                isSmallPhone && styles.avatarCircleSmall
              ]}>
                <Text style={[
                  styles.avatarText,
                  isSmallPhone && styles.avatarTextSmall
                ]}>{profile.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={[
              styles.accountInfo,
              isSmallPhone && styles.accountInfoSmall
            ]}>
              {editing ? (
                <View style={styles.editingContainer}>
                  <TextInput
                    style={[
                      styles.nameInput, 
                      inputFocused && styles.nameInputFocused,
                      isSmallPhone && styles.nameInputSmall
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="フルネーム"
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    autoCapitalize="words"
                    returnKeyType="done"
                  />
                  <View style={[
                    styles.editActions,
                    isSmallPhone && styles.editActionsSmall
                  ]}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                      <Ionicons name={saving ? "time" : "checkmark"} size={18} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.saveBtnText}>{saving ? '保存中' : '保存'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditing(false); setName(profile.name); }}>
                      <Ionicons name="close" size={18} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.cancelBtnText}>キャンセル</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.userName}>{profile.name}</Text>
                  <Text style={styles.userEmail}>{profile.email}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="mail" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.accountType}>プロフェッショナルアカウント</Text>
                  </View>
                </>
              )}
            </View>
            {!editing && (
              <TouchableOpacity style={styles.editProfileBtn} onPress={() => setEditing(true)}>
                <Ionicons name="create" size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Quick Stats */}
          <View style={[
            styles.quickStats,
            isSmallPhone && styles.quickStatsSmall
          ]}>
            <View style={styles.statItem}>
              <Text style={[
                styles.statNumber,
                isSmallPhone && styles.statNumberSmall
              ]}>{stats.total}</Text>
              <Text style={[
                styles.statLabel,
                isSmallPhone && styles.statLabelSmall
              ]}>総メール数</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[
                styles.statNumber,
                isSmallPhone && styles.statNumberSmall
              ]}>{stats.unread}</Text>
              <Text style={[
                styles.statLabel,
                isSmallPhone && styles.statLabelSmall
              ]}>未読</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[
                styles.statNumber,
                isSmallPhone && styles.statNumberSmall
              ]}>{stats.storage}</Text>
              <Text style={[
                styles.statLabel,
                isSmallPhone && styles.statLabelSmall
              ]}>使用容量</Text>
            </View>
          </View>
        </View>

        {/* Logout Section */}
        <View style={[
          styles.actionsCard,
          isTablet && styles.actionsCardTablet,
          isSmallPhone && styles.actionsCardSmall
        ]}>
          <TouchableOpacity style={[
            styles.logoutAction,
            isSmallPhone && styles.logoutActionSmall
          ]} onPress={handleLogout}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.logoutTitle}>サインアウト</Text>
              <Text style={styles.logoutDesc}>このアカウントからサインアウト</Text>
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
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    marginRight: 16,
  },
  backIcon: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountOverview: {
    backgroundColor: colors.surface,
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: 'white',
  },
  accountInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  accountType: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  editingContainer: {
    flex: 1,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    outlineStyle: 'none',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  nameInputFocused: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelBtn: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  editProfileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  editIcon: {
    fontSize: 18,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 2,
  },
  logoutDesc: {
    fontSize: 14,
    color: '#7F1D1D',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  error: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: 'white',
    fontWeight: '600',
  },

  // Responsive Styles for Tablets
  accountOverviewTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    marginHorizontal: 40,
  },
  actionsCardTablet: {
    maxWidth: 600,
    alignSelf: 'center',
    marginHorizontal: 40,
  },

  // Responsive Styles for Small Phones
  accountOverviewSmall: {
    margin: 12,
    padding: 16,
    borderRadius: 12,
  },
  accountHeaderSmall: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircleSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarTextSmall: {
    fontSize: 24,
  },
  accountInfoSmall: {
    alignItems: 'center',
    marginTop: 12,
  },
  nameInputSmall: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editActionsSmall: {
    flexDirection: 'column',
    gap: 8,
  },
  quickStatsSmall: {
    paddingTop: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statNumberSmall: {
    fontSize: 16,
  },
  statLabelSmall: {
    fontSize: 10,
  },
  actionsCardSmall: {
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 12,
  },
  logoutActionSmall: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});

export default ProfileScreen;