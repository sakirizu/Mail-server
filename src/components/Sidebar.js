import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated, Modal, ScrollView, Switch, Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

// Modern content wrapper with dynamic margin - Platform optimized
export const MainContentWrapper = ({ children, collapsed, isMobile, sidebarVisible = false }) => (
  <View style={[
    styles.mainContent,
    isMobile 
      ? { 
          marginLeft: 0,
          width: '100%',
          paddingTop: Platform.OS === 'android' ? 97 : Platform.OS === 'ios' ? 110 : 60,
          opacity: (isMobile && sidebarVisible) ? 0.3 : 1,
        } 
      : { 
          marginLeft: collapsed ? 72 : 240,
          paddingTop: Platform.OS === 'android' ? 107 : Platform.OS === 'ios' ? 110 : 72,
        }
  ]}>
    {children}
  </View>
);

// Modern Sidebar Component - Android Optimized (Full Height Floating with Side Animation)
const Sidebar = ({ onNavigate, collapsed = false, isVisible = false, isMobile = false }) => {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [activeScreen, setActiveScreen] = React.useState('Inbox');
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [draftCount, setDraftCount] = React.useState(0);
  const [spamCount, setSpamCount] = React.useState(0);
  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    readReceipts: true,
    spamFilter: true,
    autoSave: true,
    darkMode: false,
  });
  
  // Animated value for smooth slide animation
  const slideAnim = React.useRef(new Animated.Value(isMobile ? (isVisible ? 0 : -280) : 0)).current;
  
  // Animated value for modal scale
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  // Fetch mail counts
  React.useEffect(() => {
    const fetchCounts = async () => {
      if (!user || !user.token) return;

      try {
        // Fetch drafts count
        const draftsRes = await fetch(`${API_BASE_URL}/api/mails/drafts?limit=1`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (draftsRes.ok) {
          const draftsData = await draftsRes.json();
          setDraftCount(draftsData.totalCount || 0);
        }

        // Fetch spam count
        const spamRes = await fetch(`${API_BASE_URL}/api/mails/spam?limit=1`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (spamRes.ok) {
          const spamData = await spamRes.json();
          setSpamCount(spamData.totalCount || 0);
        }
      } catch (error) {
        console.error('Error fetching mail counts:', error);
      }
    };

    fetchCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Load settings from AsyncStorage
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('appSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);
  
  // Animate sidebar slide in/out from left with spring animation
  React.useEffect(() => {
    if (isMobile) {
      Animated.spring(slideAnim, {
        toValue: isVisible ? 0 : -280,
        tension: 65,
        friction: 9,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, isMobile, slideAnim]);

  // Animate modal scale
  React.useEffect(() => {
    if (settingsModalVisible) {
      // Start from small scale and animate to normal size
      scaleAnim.setValue(0.7);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [settingsModalVisible, scaleAnim]);

  // Navigation handler
  const handleNavigation = (screenName) => {
    setActiveScreen(screenName);
    if (onNavigate) {
      onNavigate(screenName);
    }
  };

  // Settings handler
  const handleSettingsPress = () => {
    setSettingsModalVisible(true);
  };

  const handleSettingChange = async (settingName, value) => {
    const newSettings = {
      ...settings,
      [settingName]: value
    };
    setSettings(newSettings);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      console.log(`${settingName} changed to:`, value);
      
      // Special handling for dark mode
      if (settingName === 'darkMode') {
        Alert.alert(
          'ダークモード',
          value ? 'ダークモードを有効にしました。アプリを再起動して変更を適用してください。' : 'ライトモードに切り替えました。',
          [{ text: 'OK' }]
        );
      }
      
      // Special handling for spam filter
      if (settingName === 'spamFilter') {
        Alert.alert(
          '迷惑メールフィルタ',
          value ? '迷惑メールフィルタを有効にしました。' : '迷惑メールフィルタを無効にしました。',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Help & Support navigation handler
  const handleHelpSupportNavigation = (screen) => {
    if (onNavigate) {
      onNavigate(screen);
    }
  };

  // Load unread count for Sidebar inbox badge
  React.useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        if (!user || !user.token) {
          setUnreadCount(0);
          return;
        }

        const response = await fetch('http://localhost:3001/api/mails/stats', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const unread = data.statistics?.unread_count || 0;
          setUnreadCount(unread);
        } else {
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
        setUnreadCount(0);
      }
    };
    
    loadUnreadCount();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Menu items configuration with modern outline-style icons
  const menuItems = [
    { 
      id: 'inbox',
      name: '受信トレイ', 
      iconType: 'Ionicons',
      iconName: 'mail-outline',
      iconNameActive: 'mail',
      screen: 'Inbox',
      count: unreadCount,
      color: '#007AFF'
    },
    { 
      id: 'sent',
      name: '送信済み', 
      iconType: 'Ionicons',
      iconName: 'paper-plane-outline',
      iconNameActive: 'paper-plane',
      screen: 'Sent',
      color: '#007AFF'
    },
    { 
      id: 'compose',
      name: '新規作成', 
      iconType: 'Ionicons',
      iconName: 'create-outline',
      iconNameActive: 'create',
      screen: 'Compose',
      color: '#007AFF'
    },
    { 
      id: 'drafts',
      name: '下書き', 
      iconType: 'Ionicons',
      iconName: 'document-text-outline',
      iconNameActive: 'document-text',
      screen: 'Drafts',
      count: draftCount,
      color: '#8E8E93'
    },
    { 
      id: 'spam',
      name: '迷惑メール', 
      iconType: 'Ionicons',
      iconName: 'shield-outline',
      iconNameActive: 'shield',
      screen: 'Spam',
      count: spamCount,
      color: '#FF3B30'
    }
  ];

  return (
    <>
      {/* Mobile Overlay for Android - Full Screen */}
      {isMobile && isVisible && (
        <TouchableOpacity 
          style={styles.mobileOverlay} 
          onPress={() => onNavigate && onNavigate('closeSidebar')}
          activeOpacity={1}
        />
      )}
      
      {/* Sidebar - conditional rendering for mobile */}
      {(isMobile ? isVisible : true) && (
        <Animated.View style={[
          styles.sidebar,
          isMobile ? [
            styles.sidebarMobile,
            {
              transform: [
                { 
                  translateX: slideAnim
                }
              ]
            }
          ] : (collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded)
        ]}>
        {/* Mobile header with logo */}
        <LinearGradient
          colors={['#007AFF', '#0051D5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.sidebarHeader, isMobile && styles.sidebarHeaderMobile]}
        >
          <View style={styles.headerContent}>
            {isMobile ? (
              <View style={styles.logoContainer}>
                <Ionicons name="mail" size={28} color="#fff" />
                <Text style={styles.logoText}>SS Mail</Text>
              </View>
            ) : (
              <>
                <Ionicons name="menu" size={24} color="#fff" />
                <Text style={styles.headerTitle}>Menu</Text>
              </>
            )}
          </View>
        </LinearGradient>
        
        {/* Menu Items */}
        <View style={[styles.menuContainer, isMobile && styles.menuContainerMobile]}>
          {menuItems.map((item) => {
            const IconComponent = Ionicons;
            const isActive = activeScreen === item.screen;
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  isActive && (!collapsed || isMobile) && styles.menuItemActive,
                  (collapsed && !isMobile) && styles.menuItemCollapsed,
                  isMobile && styles.menuItemMobile
                ]}
                onPress={() => handleNavigation(item.screen)}
                activeOpacity={0.7}
                android_ripple={{ color: item.color + '20', borderless: false }}
              >
                {isActive && (!collapsed || isMobile) && (
                  <LinearGradient
                    colors={[item.color + '20', item.color + '08']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 50 }]}
                  />
                )}
                
                {/* Icon Container */}
                <View style={[
                  styles.iconContainer,
                  (collapsed && !isMobile) && styles.iconContainerCollapsed,
                  isMobile && styles.iconContainerMobile
                ]}>
                  <IconComponent 
                    name={isActive ? item.iconNameActive : item.iconName} 
                    size={isMobile ? 24 : 22} 
                    color={isActive ? item.color : '#8E8E93'} 
                  />
                  
                  {/* Badge on icon when collapsed (desktop only) */}
                  {collapsed && !isMobile && item.count > 0 && (
                    <LinearGradient
                      colors={['#FF3B30', '#FF6B30']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.badgeCollapsed}
                    >
                      <Text style={styles.badgeTextCollapsed}>{item.count}</Text>
                    </LinearGradient>
                  )}
                </View>

                {/* Label and Count - Show when expanded or on mobile */}
                {(!collapsed || isMobile) && (
                  <View style={styles.labelContainer}>
                    <Text style={[
                      styles.label,
                      isActive && styles.labelActive,
                      isMobile && styles.labelMobile
                    ]}>
                      {item.name}
                    </Text>
                    {item.count > 0 && (
                      <LinearGradient
                        colors={['#FF3B30', '#FF6B30']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.badge, isMobile && styles.badgeMobile]}
                      >
                        <Text style={[styles.badgeText, isMobile && styles.badgeTextMobile]}>{item.count}</Text>
                      </LinearGradient>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer at bottom */}
        <View style={[styles.footerContainer, isMobile && styles.footerContainerMobile]}>
          {/* Help & Support Button */}
          <TouchableOpacity 
            style={[
              styles.footerButton,
              (collapsed && !isMobile) && styles.footerButtonCollapsed,
              isMobile && styles.footerButtonMobile
            ]}
            onPress={() => handleHelpSupportNavigation('HelpSupport')}
            activeOpacity={0.7}
            android_ripple={{ color: '#34C759' + '20', borderless: false }}
          >
            <View style={[
              styles.iconContainer,
              (collapsed && !isMobile) && styles.iconContainerCollapsed,
              isMobile && styles.iconContainerMobile
            ]}>
              <Ionicons name="help-circle-outline" size={isMobile ? 24 : 22} color="#34C759" />
            </View>
            {(!collapsed || isMobile) && (
              <Text style={[styles.footerText, isMobile && styles.footerTextMobile]}>ヘルプとサポート</Text>
            )}
          </TouchableOpacity>

          {/* Settings Button */}
          <TouchableOpacity 
            style={[
              styles.footerButton,
              (collapsed && !isMobile) && styles.footerButtonCollapsed,
              isMobile && styles.footerButtonMobile
            ]}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
            android_ripple={{ color: '#8E8E93' + '20', borderless: false }}
          >
            <View style={[
              styles.iconContainer,
              (collapsed && !isMobile) && styles.iconContainerCollapsed,
              isMobile && styles.iconContainerMobile
            ]}>
              <Ionicons name="settings-outline" size={isMobile ? 24 : 22} color="#8E8E93" />
            </View>
            {(!collapsed || isMobile) && (
              <Text style={[styles.footerText, isMobile && styles.footerTextMobile]}>設定</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
      )}

      {/* Settings Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Ionicons name="settings" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={styles.modalTitle}>設定</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Settings Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Email Settings */}
              <View style={styles.settingsSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="mail" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>メール設定</Text>
                </View>
                
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>メール通知</Text>
                    <Text style={styles.settingDesc}>新着メッセージの通知を受け取る</Text>
                  </View>
                  <Switch
                    value={settings.emailNotifications}
                    onValueChange={(value) => handleSettingChange('emailNotifications', value)}
                    trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
                    thumbColor={settings.emailNotifications ? colors.primary : '#9CA3AF'}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>開封確認</Text>
                    <Text style={styles.settingDesc}>メールを読んだことを相手に知らせる</Text>
                  </View>
                  <Switch
                    value={settings.readReceipts}
                    onValueChange={(value) => handleSettingChange('readReceipts', value)}
                    trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
                    thumbColor={settings.readReceipts ? colors.primary : '#9CA3AF'}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>迷惑メールフィルタ</Text>
                    <Text style={styles.settingDesc}>迷惑メールを自動的にフィルタリング</Text>
                  </View>
                  <Switch
                    value={settings.spamFilter}
                    onValueChange={(value) => handleSettingChange('spamFilter', value)}
                    trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
                    thumbColor={settings.spamFilter ? colors.primary : '#9CA3AF'}
                  />
                </View>
              </View>

              {/* App Settings */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>📱 アプリ設定</Text>
                
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>プッシュ通知</Text>
                    <Text style={styles.settingDesc}>プッシュ通知を受け取る</Text>
                  </View>
                  <Switch
                    value={settings.pushNotifications}
                    onValueChange={(value) => handleSettingChange('pushNotifications', value)}
                    trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
                    thumbColor={settings.pushNotifications ? colors.primary : '#9CA3AF'}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>ダークモード</Text>
                    <Text style={styles.settingDesc}>ダークテーマを使用</Text>
                  </View>
                  <Switch
                    value={settings.darkMode}
                    onValueChange={(value) => handleSettingChange('darkMode', value)}
                    trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
                    thumbColor={settings.darkMode ? colors.primary : '#9CA3AF'}
                  />
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>自動同期</Text>
                    <Text style={styles.settingDesc}>メールを自動的に同期</Text>
                  </View>
                  <Switch
                    value={settings.autoSync}
                    onValueChange={(value) => handleSettingChange('autoSync', value)}
                    trackColor={{ false: '#E5E7EB', true: colors.primary + '40' }}
                    thumbColor={settings.autoSync ? colors.primary : '#9CA3AF'}
                  />
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.settingsSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="construct" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>クイックアクション</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={async () => {
                    Alert.alert(
                      'キャッシュのクリア',
                      'キャッシュをクリアしますか？',
                      [
                        { text: 'キャンセル', style: 'cancel' },
                        { 
                          text: 'クリア', 
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              // Clear cache items but keep user data
                              const keys = await AsyncStorage.getAllKeys();
                              const cacheKeys = keys.filter(key => 
                                key.includes('cache') || key.includes('temp')
                              );
                              await AsyncStorage.multiRemove(cacheKeys);
                              Alert.alert('成功', 'キャッシュをクリアしました');
                            } catch (error) {
                              Alert.alert('エラー', 'キャッシュのクリアに失敗しました');
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>キャッシュのクリア</Text>
                    <Text style={styles.actionDesc}>ストレージ容量を解放</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={async () => {
                    try {
                      const response = await fetch(`${API_BASE_URL}/api/mails/inbox`, {
                        headers: {
                          'Authorization': `Bearer ${user?.token}`
                        }
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        const jsonData = JSON.stringify(data.mails || [], null, 2);
                        
                        // For web, create download
                        if (Platform.OS === 'web') {
                          const blob = new Blob([jsonData], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `emails_export_${new Date().getTime()}.json`;
                          link.click();
                          URL.revokeObjectURL(url);
                          
                          Alert.alert('成功', `${data.mails?.length || 0}件のメールをエクスポートしました`);
                        } else {
                          // For mobile, show data info
                          Alert.alert(
                            'データのエクスポート',
                            `${data.mails?.length || 0}件のメールがあります。\nモバイルでは、Web版を使用してエクスポートしてください。`,
                            [{ text: 'OK' }]
                          );
                        }
                      } else {
                        Alert.alert('エラー', 'メールの取得に失敗しました');
                      }
                    } catch (error) {
                      console.error('Export error:', error);
                      Alert.alert('エラー', 'エクスポートに失敗しました');
                    }
                  }}
                >
                  <Ionicons name="cloud-upload-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>データのエクスポート</Text>
                    <Text style={styles.actionDesc}>メールをダウンロード</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={() => {
                    Alert.alert(
                      'すべて更新',
                      'すべてのメールアカウントを同期しています...',
                      [{ text: 'OK' }]
                    );
                  }}
                >
                  <Ionicons name="sync-outline" size={20} color={colors.text} style={{ marginRight: 12 }} />
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>すべて更新</Text>
                    <Text style={styles.actionDesc}>すべてのメールアカウントを同期</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.doneButtonText}>完了</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

// Modern Styles
const styles = StyleSheet.create({
  // Sidebar Container - Web-like design with proper height
  sidebar: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'android' ? 97 : Platform.OS === 'ios' ? 110 : 60,
    bottom: 0,
    backgroundColor: colors.surface,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    flexDirection: 'column',
    paddingTop: 0,
  },

  // Sidebar States
  sidebarExpanded: {
    width: 240,
  },
  sidebarCollapsed: {
    width: 72,
  },
  sidebarMobile: {
    width: 280,
    position: 'absolute',   
    top: Platform.OS === 'android' ? 95 : Platform.OS === 'ios' ? 110 : 70,
    bottom: 0,
    left: 0,                
    zIndex: 1000,           
    elevation: 24,          
    paddingTop: 0,          
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderRightWidth: 1,    
    borderRightColor: '#e5e7eb',
    backgroundColor: colors.surface,
  },
  
  // Mobile Overlay for Android - Behind floating sidebar
  mobileOverlay: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 95 : Platform.OS === 'ios' ? 110 : 70,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 999,
  },

  // Android-friendly header - Full height mobile
  sidebarHeader: {
    height: 72,
    backgroundColor: 'transparent',
    display: 'none',
  },
  sidebarHeaderMobile: {
    height: 60,
    flexDirection: 'row',
    borderBottomWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
    paddingHorizontal: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Menu Container
  menuContainer: {
    padding: 8,
    flex: 1,
    paddingTop: 16,
  },
  menuContainerMobile: {
    padding: 16,
    paddingTop: 20,         // Clean spacing after header
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Menu Item - Modern design with animations
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 6,
    borderRadius: 50,
    marginHorizontal: 4,
    backgroundColor: 'transparent',
    minHeight: 48,
    minWidth: 48,
    overflow: 'hidden',
  },
  menuItemActive: {
    // Clean style - no shadow
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 0,
    marginLeft: 8,
    marginRight: 8,
    width: 56,
    minWidth: 56,
    borderRadius: 28,
  },
  menuItemMobile: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
    borderRadius: 50,
    backgroundColor: 'transparent',
  },

  // Icon Container - Modern design with scale animation
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginRight: 12,
  },
  iconContainerActive: {
    // Remove duplicate active styles - only keep inline backgroundColor
  },
  iconContainerCollapsed: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginVertical: 0,
    marginHorizontal: 0,
  },
  iconContainerMobile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  // Icon - Web-like design
  icon: {
    fontSize: 18,           // Web-like size
    color: '#6b7280',       // Web-like gray color
    textAlign: 'center',
  },
  iconActive: {
    color: '#3b82f6',       // Web-like blue
  },
  iconMobile: {
    fontSize: 18,           // Consistent size
  },

  // Label Container
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 0,          // No extra margin for web-like feel
    marginRight: 8,
  },

  // Label - Web-like design  
  label: {
    fontSize: 14,
    fontWeight: '500',      // Web-like medium weight
    color: '#374151',       // Web-like dark gray
    letterSpacing: 0,
  },
  labelActive: {
    color: '#3b82f6',       // Web-like blue
    fontWeight: '600',      // Web-like semibold
  },
  labelMobile: {
    fontSize: 14,           // Consistent with web
    fontWeight: '500',
    color: '#374151',
  },

  // Badge
  badge: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
  },
  badgeMobile: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
  },
  badgeTextMobile: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Badge on collapsed icon
  badgeCollapsed: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextCollapsed: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Footer - Web-like design
  footerContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: colors.surface,
  },
  footerContainerMobile: {
    padding: 16,
    paddingBottom: 24,      // Web-like bottom padding
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: colors.surface,
  },
  
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,        // Web-like rounded corners
    backgroundColor: 'transparent',
    minHeight: 48,
  },
  footerButtonCollapsed: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginLeft: 8,
    marginRight: 8,
    width: 56,
    minWidth: 56,
    borderRadius: 28,
  },
  footerButtonMobile: {
    minHeight: 48,          // Web-like height
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,        // Web-like rounded corners
  },
  footerText: {
    fontSize: 14,
    color: '#374151',       // Web-like dark gray
    fontWeight: '500',      // Web-like medium weight
    marginLeft: 12,
    marginRight: 8,
  },
  footerTextMobile: {
    fontSize: 14,           // Consistent with web
    fontWeight: '500',
    marginLeft: 12,
    color: '#374151',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 20 : 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 20 : 0,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    height: Platform.OS === 'web' ? 'auto' : '100%',
    maxHeight: Platform.OS === 'web' ? '80%' : '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  actionInfo: {
    flex: 1,
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  actionArrow: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Main Content - Android optimized
  mainContent: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    overflow: 'hidden',
    position: 'relative',   // For proper z-index layering
    zIndex: 1,              // Lower than sidebar
  },
});

export default Sidebar;