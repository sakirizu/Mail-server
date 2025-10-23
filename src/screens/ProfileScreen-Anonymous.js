import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:4000/api/profile';

const ProfileScreen = ({ navigation }) => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Settings states
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    autoDelete: false,
    readReceipts: true,
    spamFilter: true,
  });

  // Fetch profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://localhost:4000/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const profileData = {
            name: data.user.name || data.user.username,
            email: data.user.email,
            username: data.user.username,
            created_at: data.user.created_at
          };
          
          setProfile(profileData);
          setName(profileData.name);
        } else {
          throw new Error('Profile yuklanmadi');
        }
      } catch (e) {
        console.error('Profile fetch error:', e);
        setError('Profile ma\'lumotlarini yuklashda xatolik');
        
        // Fallback to user context data if available
        if (user) {
          const fallbackProfile = {
            name: user.username || 'User',
            email: user.email || 'user@smail.com',
            username: user.username
          };
          setProfile(fallbackProfile);
          setName(fallbackProfile.name);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchProfile();
    } else {
      setError('Tizimga kiring');
      setLoading(false);
    }
  }, [user]);

  // Save edited name
  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('http://localhost:4000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          name: name.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Update profile locally
        const updatedProfile = { ...profile, name: name.trim() };
        setProfile(updatedProfile);
        setEditing(false);
        
        console.log('Profile updated successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile yangilanmadi');
      }
    } catch (e) {
      console.error('Profile update error:', e);
      setError('Profile yangilashda xatolik: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (settingName, value) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
    
    // Show a quick feedback to user
    console.log(`${settingName} changed to:`, value);
    
    // You can add API call here to save settings
    // saveSetting(settingName, value);
  };

  const handleLogout = () => {
    // Navigate back to inbox instead of login for now
    navigation?.navigate('Inbox');
  };

  const handleSecurityPress = () => {
    console.log('Security & Privacy pressed');
    // You can navigate to security screen or show modal
  };

  const handleStatisticsPress = () => {
    console.log('Statistics pressed');
    navigation.navigate('Statistics');
  };

  const handleHelpPress = () => {
    console.log('Help & Support pressed');
    // You can navigate to help screen or show modal
  };

  const handleStoragePress = () => {
    console.log('Manage Storage pressed');
    // You can navigate to storage management screen
  };

  const handleSyncPress = () => {
    console.log('Sync Settings pressed');
    // You can navigate to sync settings screen
  };

  const handleExportPress = () => {
    console.log('Export Data pressed');
    // You can start data export process
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
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.error}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => window.location.reload()}>
            <Text style={styles.retryBtnText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back button header */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Account Overview */}
        <View style={styles.accountOverview}>
          <View style={styles.accountHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{profile.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
              </View>
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.accountInfo}>
              {editing ? (
                <View style={styles.editingContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Full Name"
                    placeholderTextColor={colors.placeholder}
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                      <Text style={styles.saveBtnText}>{saving ? '⏳' : '✓'} {saving ? 'Saving' : 'Save'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditing(false); setName(profile.name); }}>
                      <Text style={styles.cancelBtnText}>✕ Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.userName}>{profile.name}</Text>
                  <Text style={styles.userEmail}>{profile.email}</Text>
                  <Text style={styles.accountType}>📧 Professional Account</Text>
                </>
              )}
            </View>
            {!editing && (
              <TouchableOpacity style={styles.editProfileBtn} onPress={() => setEditing(true)}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>847</Text>
              <Text style={styles.statLabel}>Total Emails</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>23</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.2GB</Text>
              <Text style={styles.statLabel}>Storage Used</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.statisticsAction} onPress={handleStatisticsPress}>
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Statistics</Text>
              <Text style={styles.actionDesc}>Email usage and security reports</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Email Preferences */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📧</Text>
            <Text style={styles.cardTitle}>Email Preferences</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Email Notifications</Text>
              <Text style={styles.settingDesc}>Get notified for new messages</Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={(value) => handleSettingChange('emailNotifications', value)}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={settings.emailNotifications ? colors.primary : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Read Receipts</Text>
              <Text style={styles.settingDesc}>Let others know when you read emails</Text>
            </View>
            <Switch
              value={settings.readReceipts}
              onValueChange={(value) => handleSettingChange('readReceipts', value)}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={settings.readReceipts ? colors.primary : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Advanced Spam Filter</Text>
              <Text style={styles.settingDesc}>Enhanced protection from unwanted emails</Text>
            </View>
            <Switch
              value={settings.spamFilter}
              onValueChange={(value) => handleSettingChange('spamFilter', value)}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={settings.spamFilter ? colors.primary : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>

        {/* Application Settings */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>⚙️</Text>
            <Text style={styles.cardTitle}>Application Settings</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Real-time alerts on your device</Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) => handleSettingChange('pushNotifications', value)}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={settings.pushNotifications ? colors.primary : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Dark Mode</Text>
              <Text style={styles.settingDesc}>Easier on the eyes in low light</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => handleSettingChange('darkMode', value)}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={settings.darkMode ? colors.primary : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Auto-Archive</Text>
              <Text style={styles.settingDesc}>Automatically archive old emails after 30 days</Text>
            </View>
            <Switch
              value={settings.autoDelete}
              onValueChange={(value) => handleSettingChange('autoDelete', value)}
              trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
              thumbColor={settings.autoDelete ? colors.primary : '#9CA3AF'}
              ios_backgroundColor="#E5E7EB"
            />
          </View>
        </View>

        {/* Storage & Sync */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>☁️</Text>
            <Text style={styles.cardTitle}>Storage & Sync</Text>
          </View>
          
          <TouchableOpacity style={styles.actionRow} onPress={handleStoragePress}>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Manage Storage</Text>
              <Text style={styles.settingDesc}>4.2GB of 15GB used (28%)</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleSyncPress}>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Sync Settings</Text>
              <Text style={styles.settingDesc}>Configure email synchronization</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleExportPress}>
            <View style={styles.settingContent}>
              <Text style={styles.settingName}>Export Data</Text>
              <Text style={styles.settingDesc}>Download a copy of your emails</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.securityAction} onPress={handleSecurityPress}>
            <Text style={styles.actionIcon}>🔐</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Security & Privacy</Text>
              <Text style={styles.actionDesc}>Manage password and security settings</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpAction} onPress={handleHelpPress}>
            <Text style={styles.actionIcon}>❓</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Help & Support</Text>
              <Text style={styles.actionDesc}>Get help or contact support</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteAction} 
            onPress={() => navigation.navigate('DeleteAccount')}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.deleteTitle}>Delete Account</Text>
              <Text style={styles.deleteDesc}>Permanently delete your account</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutAction} onPress={handleLogout}>
            <Text style={styles.actionIcon}>🚪</Text>
            <View style={styles.actionContent}>
              <Text style={styles.logoutTitle}>Sign Out</Text>
              <Text style={styles.logoutDesc}>Sign out from this account</Text>
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
    paddingVertical: 16,
    paddingTop: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '15',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  
  // Account Overview Styles
  accountOverview: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  accountInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
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
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: 16,
  },
  
  // Editing Styles
  editingContainer: {
    flex: 1,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingVertical: 8,
    marginBottom: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
  },
  cancelBtnText: {
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  
  // Settings Cards
  settingsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionArrow: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  
  // Account Actions
  actionsCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  securityAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statisticsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  helpAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
    marginBottom: 4,
  },
  logoutDesc: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  
  // Delete Account Styles
  deleteAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEAEA',
    borderWidth: 1,
    borderColor: '#FFB3B3',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
    marginBottom: 4,
  },
  deleteDesc: {
    fontSize: 14,
    color: '#DC2626',
    opacity: 0.7,
  },
  
  // Error/Loading States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
  },
  error: {
    color: '#DC2626',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
