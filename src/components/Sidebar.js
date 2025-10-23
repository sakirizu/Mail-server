import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated, Modal, ScrollView, Switch, Platform } from 'react-native';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

// Modern content wrapper with dynamic margin - Platform optimized
export const MainContentWrapper = ({ children, collapsed, isMobile, sidebarVisible = false }) => (
  <View style={[
    styles.mainContent,
    isMobile 
      ? { 
          marginLeft: 0,        // No margin on mobile - content stays in place
          width: '100%',        // Full width on mobile
          paddingTop: Platform.OS === 'android' ? 97 : 60,      // Android'da 97px (27+70), web'da 60px
          opacity: (isMobile && sidebarVisible) ? 0.3 : 1, // Dim content when sidebar is open
        } 
      : { 
          marginLeft: collapsed ? 64 : 240,  // Desktop: 64px collapsed, 240px expanded
          paddingTop: Platform.OS === 'android' ? 107 : 72,      // Android'da 107px (27+70+10), web'da 72px
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
  
  // Animate sidebar slide in/out from left
  React.useEffect(() => {
    if (isMobile) {
      Animated.timing(slideAnim, {
        toValue: isVisible ? 0 : -280, // 0 visible, -280 hidden (slides from left)
        duration: 300,
        useNativeDriver: true, // Use native driver for better performance
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

  const handleSettingChange = (settingName, value) => {
    setSettings(prev => ({
      ...prev,
      [settingName]: value
    }));
    console.log(`${settingName} changed to:`, value);
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

  // Menu items configuration
  const menuItems = [
    { 
      id: 'inbox',
      name: '受信トレイ', 
      icon: '📧', 
      screen: 'Inbox',
      count: unreadCount // Show unread count for Inbox in sidebar
    },
    { 
      id: 'sent',
      name: '送信済み', 
      icon: '📤', 
      screen: 'Sent'
      // No count for sent items as user requested
    },
    { 
      id: 'compose',
      name: '新規作成', 
      icon: '✏️', 
      screen: 'Compose' 
    },
    { 
      id: 'drafts',
      name: '下書き', 
      icon: '📄', 
      screen: 'Drafts',
      count: 7 // Draft emails
    },
    { 
      id: 'spam',
      name: '迷惑メール', 
      icon: '🚫', 
      screen: 'Spam',
      count: 6 // Spam emails
    },
    { 
      id: 'statistics',
      name: '統計', 
      icon: '📊', 
      screen: 'Statistics'
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
        <View style={[styles.sidebarHeader, isMobile && styles.sidebarHeaderMobile]}>
          <View style={styles.headerContent}>
            {isMobile ? (
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>📧 Mail</Text>
              </View>
            ) : (
              <Text style={styles.headerTitle}>Menu</Text>
            )}
          </View>
        </View>
        
        {/* Menu Items */}
        <View style={[styles.menuContainer, isMobile && styles.menuContainerMobile]}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                activeScreen === item.screen && styles.menuItemActive,
                (collapsed && !isMobile) && styles.menuItemCollapsed,
                isMobile && styles.menuItemMobile
              ]}
              onPress={() => handleNavigation(item.screen)}
              activeOpacity={0.6}
              android_ripple={{ color: colors.primary + '20', borderless: false }}
            >
              {/* Icon Container */}
              <View style={[
                styles.iconContainer,
                activeScreen === item.screen && styles.iconContainerActive,
                (collapsed && !isMobile) && styles.iconContainerCollapsed,
                isMobile && styles.iconContainerMobile
              ]}>
                <Text style={[
                  styles.icon,
                  activeScreen === item.screen && styles.iconActive,
                  isMobile && styles.iconMobile
                ]}>
                  {item.icon}
                </Text>
                {/* Badge on icon when collapsed (desktop only) */}
                {collapsed && !isMobile && item.count > 0 && (
                  <View style={styles.badgeCollapsed}>
                    <Text style={styles.badgeTextCollapsed}>{item.count}</Text>
                  </View>
                )}
              </View>

              {/* Label and Count - Show when expanded or on mobile */}
              {(!collapsed || isMobile) && (
                <View style={styles.labelContainer}>
                  <Text style={[
                    styles.label,
                    activeScreen === item.screen && styles.labelActive,
                    isMobile && styles.labelMobile
                  ]}>
                    {item.name}
                  </Text>
                  {item.count > 0 && (
                    <View style={[styles.badge, isMobile && styles.badgeMobile]}>
                      <Text style={[styles.badgeText, isMobile && styles.badgeTextMobile]}>{item.count}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
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
            activeOpacity={0.6}
            android_ripple={{ color: colors.primary + '20', borderless: false }}
          >
            <View style={[
              styles.iconContainer,
              (collapsed && !isMobile) && styles.iconContainerCollapsed,
              isMobile && styles.iconContainerMobile
            ]}>
              <Text style={[styles.icon, isMobile && styles.iconMobile]}>❓</Text>
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
            activeOpacity={0.6}
            android_ripple={{ color: colors.primary + '20', borderless: false }}
          >
            <View style={[
              styles.iconContainer,
              (collapsed && !isMobile) && styles.iconContainerCollapsed,
              isMobile && styles.iconContainerMobile
            ]}>
              <Text style={[styles.icon, isMobile && styles.iconMobile]}>⚙️</Text>
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
              <Text style={styles.modalTitle}>⚙️ 設定</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Settings Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Email Settings */}
              <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>📧 メール設定</Text>
                
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
                <Text style={styles.sectionTitle}>🔧 クイックアクション</Text>
                
                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>キャッシュのクリア</Text>
                    <Text style={styles.actionDesc}>ストレージ容量を解放</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>📤</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>データのエクスポート</Text>
                    <Text style={styles.actionDesc}>メールをダウンロード</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>🔄</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>すべて更新</Text>
                    <Text style={styles.actionDesc}>すべてのメールアカウントを同期</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.doneButton}
                onPress={() => setSettingsModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>✓ 完了</Text>
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
    top: Platform.OS === 'android' ? 97 : 60,           // Android'da 97px (27+70), web'da 60px
    bottom: 0,          // Bottom gacha
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
    width: 64,
  },
  sidebarMobile: {
    width: 280,             // Fixed width like web
    position: 'absolute',   
    top: Platform.OS === 'android' ? 95 : 70,               // Android'da 97px (27+70), web'da 60px
    bottom: 0,              // Bottom gacha
    left: 0,                
    zIndex: 1000,           
    elevation: 24,          
    paddingTop: 0,          
    borderTopRightRadius: 8,    // Slight rounded corners like web
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
    top: Platform.OS === 'android' ? 95 : 70,               // Android'da 97px (27+70), web'da 60px
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 999,            // Just below the sidebar
  },

  // Android-friendly header - Full height mobile
  sidebarHeader: {
    height: 72,             // Match TopBar height
    backgroundColor: 'transparent',
    display: 'none',
  },
  sidebarHeaderMobile: {
    height: 50,             // TopBar ostida bo'lgani uchun kichikroq
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,          // TopBar ostida bo'lgani uchun paddingTop kerak emas
    paddingHorizontal: 16,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },

  // Menu Container
  menuContainer: {
    padding: 12,
    flex: 1,
    paddingTop: 20,
  },
  menuContainerMobile: {
    padding: 16,
    paddingTop: 20,         // Clean spacing after header
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Menu Item - Web-like design
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 4,
    borderRadius: 8,        // Web-like rounded corners
    marginHorizontal: 8,
    backgroundColor: 'transparent',
    minHeight: 48,
  },
  menuItemActive: {
    backgroundColor: '#3b82f620',
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    padding: 0,
  },
  menuItemMobile: {
    minHeight: 48,          // Web-like height
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
    borderRadius: 8,        // Web-like rounded corners
    backgroundColor: 'transparent',
  },

  // Icon Container - Web-like design
  iconContainer: {
    width: 40,              // Web-like size
    height: 40,
    borderRadius: 8,        // Web-like rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: '#3b82f620',
  },
  iconContainerCollapsed: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
  },
  iconContainerMobile: {
    width: 40,              // Web-like size
    height: 40,
    borderRadius: 8,        // Web-like rounded corners
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
    padding: 12,
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
    padding: 12,
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
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
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