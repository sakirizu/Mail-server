import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated, Modal, ScrollView, Switch } from 'react-native';
import { colors } from '../styles/theme';

// Modern content wrapper with dynamic margin - Android optimized
export const MainContentWrapper = ({ children, collapsed, isMobile }) => (
  <View style={[
    styles.mainContent,
    isMobile 
      ? { 
          marginLeft: 0,        // No margin on mobile - content stays in place
          width: '100%',        // Full width on mobile
          paddingTop: 0,        // Remove top padding on mobile for better space usage
        } 
      : { 
          marginLeft: collapsed ? 64 : 240,  // Desktop: 64px collapsed, 240px expanded
          paddingTop: 0,        // Remove top padding - TopBar handles spacing
        }
  ]}>
    {children}
  </View>
);

// Modern Sidebar Component - Android Optimized (Full Height Floating with Side Animation)
const Sidebar = ({ onNavigate, collapsed = false, isVisible = false, isMobile = false }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [activeScreen, setActiveScreen] = React.useState('Inbox');
  const [settingsModalVisible, setSettingsModalVisible] = React.useState(false);
  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    readReceipts: true,
    spamFilter: true,
    autoSync: true,
  });
  
  // Animated value for smooth slide animation
  const slideAnim = React.useRef(new Animated.Value(isMobile ? (isVisible ? 0 : -100) : 0)).current;
  
  // Animated value for modal scale
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  
  // Animate sidebar slide in/out from left
  React.useEffect(() => {
    if (isMobile) {
      Animated.timing(slideAnim, {
        toValue: isVisible ? 0 : -100, // 0% visible, -100% hidden (slides from left)
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

  // Help & Support navigation handler
  const handleHelpSupportNavigation = (screen) => {
    if (onNavigate) {
      onNavigate(screen);
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

  // Menu items configuration
  const menuItems = [
    { 
      id: 'inbox',
      name: 'Inbox', 
      icon: '📧', 
      screen: 'Inbox',
      count: 12 // Unread count
    },
    { 
      id: 'sent',
      name: 'Sent', 
      icon: '📤', 
      screen: 'Sent' 
    },
    { 
      id: 'compose',
      name: 'Compose', 
      icon: '✏️', 
      screen: 'Compose' 
    },
    { 
      id: 'drafts',
      name: 'Drafts', 
      icon: '📄', 
      screen: 'Drafts',
      count: 7 // Draft emails
    },
    { 
      id: 'spam',
      name: 'Spam', 
      icon: '🚫', 
      screen: 'Spam',
      count: 6 // Spam emails
    },
    { 
      id: 'statistics',
      name: 'Statistics', 
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
      
      <Animated.View style={[
        styles.sidebar,
        isMobile ? [
          styles.sidebarMobile,
          {
            transform: [
              { 
                translateX: slideAnim.interpolate({
                  inputRange: [-100, 0],
                  outputRange: ['-100%', '0%'], // Slides from left (-100%) to visible (0%)
                })
              }
            ]
          }
        ] : (collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded)
      ]}>
        {/* Header with proper spacing from top */}
        <View style={[styles.sidebarHeader, isMobile && styles.sidebarHeaderMobile]}>
          <View style={styles.headerContent}>
            <Text style={[
              styles.headerTitle, 
              isMobile && { color: 'white' }  // White color for mobile
            ]}>
              Menu
            </Text>
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
                {collapsed && !isMobile && item.count && (
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
                  {item.count && (
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
              <Text style={[styles.footerText, isMobile && styles.footerTextMobile]}>Help & Support</Text>
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
              <Text style={[styles.footerText, isMobile && styles.footerTextMobile]}>Settings</Text>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

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
              <Text style={styles.modalTitle}>⚙️ Settings</Text>
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
                <Text style={styles.sectionTitle}>📧 Email Settings</Text>
                
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Email Notifications</Text>
                    <Text style={styles.settingDesc}>Get notified for new messages</Text>
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
                    <Text style={styles.settingTitle}>Read Receipts</Text>
                    <Text style={styles.settingDesc}>Let others know when you read emails</Text>
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
                    <Text style={styles.settingTitle}>Spam Filter</Text>
                    <Text style={styles.settingDesc}>Automatically filter spam emails</Text>
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
                <Text style={styles.sectionTitle}>📱 App Settings</Text>
                
                <View style={styles.settingItem}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Push Notifications</Text>
                    <Text style={styles.settingDesc}>Receive push notifications</Text>
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
                    <Text style={styles.settingTitle}>Dark Mode</Text>
                    <Text style={styles.settingDesc}>Use dark theme</Text>
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
                    <Text style={styles.settingTitle}>Auto Sync</Text>
                    <Text style={styles.settingDesc}>Automatically sync emails</Text>
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
                <Text style={styles.sectionTitle}>🔧 Quick Actions</Text>
                
                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Clear Cache</Text>
                    <Text style={styles.actionDesc}>Free up storage space</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>📤</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Export Data</Text>
                    <Text style={styles.actionDesc}>Download your emails</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>🔄</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Refresh All</Text>
                    <Text style={styles.actionDesc}>Sync all email accounts</Text>
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
                <Text style={styles.doneButtonText}>✓ Done</Text>
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
  // Sidebar Container - Full Height Floating with Side Animation
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 10,           
    bottom: 0,
    backgroundColor: colors.surface,
    zIndex: 30,
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    backdropFilter: 'blur(10px)',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 0, // Remove padding - start from top
    // CSS transitions removed - using Animated API instead
  },

  // Sidebar States
  sidebarExpanded: {
    width: 240,
  },
  sidebarCollapsed: {
    width: 64,
  },
  sidebarMobile: {
    width: '85%',           // 85% of screen width for better Android UX
    maxWidth: 320,          // Maximum width for large screens
    zIndex: 1000,           // Very high z-index to float above everything
    elevation: 24,          // Maximum elevation for floating effect
    paddingTop: 0,          // No top padding - full height
    borderTopRightRadius: 0, // No rounded corners for full height
    borderBottomRightRadius: 0,
    shadowColor: colors.primary,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderRightWidth: 0,    // No border for cleaner look
    // Animated transform is handled by Animated.View, not CSS
  },
  
  // Mobile Overlay for Android - Behind floating sidebar
  mobileOverlay: {
    position: 'fixed',
    top: 0,
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
    display: 'flex',        // Show header on desktop too
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sidebarHeaderMobile: {
    height: 80,             // Proper header space on mobile
    display: 'flex',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,         // Account for status bar
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,      // Dark color for desktop
    textAlign: 'center',
  },

  // Menu Container
  menuContainer: {
    padding: 8,
    flex: 1,
    marginTop: 16,         // More space above Inbox
  },
  menuContainerMobile: {
    padding: 16,
    paddingTop: 24,         // More space after header
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    marginBottom: 4,
    borderRadius: 24,
    minHeight: 48,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemActive: {
    backgroundColor: colors.primary + '12',
  },
  menuItemCollapsed: {
    justifyContent: 'center',
    padding: 0,
  },
  menuItemMobile: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 1,
  },

  // Icon Container
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  iconContainerActive: {
    backgroundColor: colors.primary + '20',
  },
  iconContainerCollapsed: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
  },
  iconContainerMobile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 16,
  },

  // Icon
  icon: {
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },
  iconActive: {
    color: colors.primary,
  },
  iconMobile: {
    fontSize: 22,
  },

  // Label Container
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 12,
    marginRight: 16,
  },

  // Label
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  labelMobile: {
    fontSize: 16,
    fontWeight: '500',
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

  // Footer
  footerContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerContainerMobile: {
    padding: 16,
    paddingBottom: 32,      // Extra bottom padding for full height
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    borderRadius: 24,
    backgroundColor: 'transparent',
    minHeight: 48,
    overflow: 'hidden',
  },
  footerButtonCollapsed: {
    justifyContent: 'center',
  },
  footerButtonMobile: {
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '400',
    marginLeft: 12,
    marginRight: 16,
  },
  footerTextMobile: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
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
    boxShadow: 'none',
    overflow: 'hidden',
    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',   // For proper z-index layering
  },
});

export default Sidebar;