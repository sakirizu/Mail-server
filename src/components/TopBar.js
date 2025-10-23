import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, useWindowDimensions, Modal, ScrollView, Alert, Platform } from 'react-native';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const TopBar = ({ onMenuPress, onProfilePress, onStatisticsPress }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 768;
  
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [accountSwitcherVisible, setAccountSwitcherVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationTitle, setConfirmationTitle] = useState('');
  const [confirmationOptions, setConfirmationOptions] = useState([]);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingSignOutAction, setPendingSignOutAction] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const { user, accounts, signOut, signOutAll, switchAccount, removeAccount } = useAuth();

  // Confirmation modal functions
  const showConfirmation = (title, message, options) => {
    setConfirmationTitle(title);
    setConfirmationMessage(message);
    setConfirmationOptions(options);
    setConfirmationModalVisible(true);
  };

  const closeConfirmation = () => {
    setConfirmationModalVisible(false);
    setConfirmationTitle('');
    setConfirmationMessage('');
    setConfirmationOptions([]);
  };

  // Message modal functions
  const showMessage = (title, message, type = 'info') => {
    setMessageTitle(title);
    setMessageText(message);
    setMessageType(type);
    setMessageModalVisible(true);
  };

  const closeMessage = () => {
    setMessageModalVisible(false);
    setMessageTitle('');
    setMessageText('');
    setMessageType('info');
  };

  const handleAddAnotherAccount = () => {
    console.log('handleAddAnotherAccount called');
    setAccountSwitcherVisible(false);
    // Simply clear current user but keep accounts for switching back
    signOut();
  };

  const handleSignOut = () => {
    console.log('handleSignOut called, accounts length:', accounts.length);
    
    if (accounts.length > 1) {
      // Multiple accounts - show choice modal
      showConfirmation(
        '🚪 サインアウト',
        '複数のアカウントがあります。このアカウントのみからサインアウトしますか、それともすべてのアカウントからサインアウトしますか？',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
            onPress: closeConfirmation
          },
          {
            text: 'このアカウント',
            style: 'primary',
            onPress: () => {
              console.log('Single account signOut requested');
              setPendingSignOutAction('single');
              closeConfirmation();
              setTwoFactorModalVisible(true);
            }
          },
          {
            text: 'すべてのアカウント',
            style: 'destructive',
            onPress: () => {
              console.log('All accounts signOut requested');
              setPendingSignOutAction('all');
              closeConfirmation();
              setTwoFactorModalVisible(true);
            }
          }
        ]
      );
    } else {
      // Single account - direct to 2FA
      showConfirmation(
        '🚪 サインアウト',
        'サインアウトしてもよろしいですか？',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
            onPress: closeConfirmation
          },
          {
            text: 'サインアウト',
            style: 'destructive',
            onPress: () => {
              console.log('Single account signOut requested');
              setPendingSignOutAction('single');
              closeConfirmation();
              setTwoFactorModalVisible(true);
            }
          }
        ]
      );
    }
  };

  const handleSignOutAll = () => {
    console.log('handleSignOutAll called');
    
    showConfirmation(
      '🚪 すべてサインアウト',
      'すべてのアカウントからサインアウトしてもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
          onPress: closeConfirmation
        },
        {
          text: 'すべてサインアウト',
          style: 'destructive',
          onPress: () => {
            console.log('Confirmed signOutAll requested');
            setPendingSignOutAction('all');
            closeConfirmation();
            setTwoFactorModalVisible(true);
          }
        }
      ]
    );
  };

  const handle2FAVerification = async () => {
    if (!twoFactorCode.trim()) {
      showMessage('❌ Error', 'Please enter the 2FA code', 'error');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate 2FA verification API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if code is valid (demo: accept 123456 or any 6-digit code)
      if (twoFactorCode === '123456' || twoFactorCode.length === 6) {
        console.log('2FA verified successfully');
        
        // Close modal first
        setTwoFactorModalVisible(false);
        setTwoFactorCode('');
        
        // Execute pending sign out action
        if (pendingSignOutAction === 'single') {
          console.log('Executing single account signOut');
          signOut();
        } else if (pendingSignOutAction === 'all') {
          console.log('Executing all accounts signOut');
          signOutAll();
        }
        
        setPendingSignOutAction(null);
        showMessage('✅ Success', 'Successfully signed out', 'success');
      } else {
        showMessage('❌ Error', 'Invalid 2FA code. Please try again.', 'error');
      }
    } catch (error) {
      console.error('2FA verification error:', error);
      showMessage('❌ Error', 'Failed to verify 2FA code. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const cancel2FA = () => {
    setTwoFactorModalVisible(false);
    setTwoFactorCode('');
    setPendingSignOutAction(null);
  };

  const handleSwitchAccount = async (account) => {
    setAccountSwitcherVisible(false);
    try {
      await switchAccount(account);
    } catch (error) {
      Alert.alert('Switch Account Failed', 'Unable to switch to this account.');
    }
  };

  const handleRemoveAccount = (accountId) => {
    Alert.alert(
      'Remove Account',
      'Are you sure you want to remove this account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeAccount(accountId), style: 'destructive' }
      ]
    );
  };

  const handleProfilePress = () => {
    console.log('Profile button pressed, current state:', profileMenuVisible);
    setProfileMenuVisible(!profileMenuVisible);
  };

  const handleProfileMenuAction = (action) => {
    console.log('Profile menu action called with:', action);
    setProfileMenuVisible(false);
    if (action === 'profile') {
      onProfilePress && onProfilePress();
    } else if (action === 'statistics') {
      onStatisticsPress && onStatisticsPress();
    } else if (action === 'accounts') {
      setAccountSwitcherVisible(true);
    } else if (action === 'logout') {
      console.log('Logout action triggered, calling handleSignOut');
      handleSignOut();
    } else if (action === 'logout-all') {
      handleSignOutAll();
    }
  };

  return (
    <>
      {/* Status Bar - faqat Android uchun telefon ma'lumotlari */}
      {Platform.OS === 'android' && <View style={styles.statusBar} />}
      <View style={[styles.topbar, isMobile && styles.topbarMobile]}>
      {/* Left Section - Menu and Logo */}
      <View style={styles.leftSection}>
        {/* Menu Toggle */}
        <TouchableOpacity 
          style={styles.menuToggle}
          onPress={onMenuPress}
        >
          <View style={styles.hamburgerIcon}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>

        {/* Logo - faqat desktop'da ko'rsatish, mobile'da sidebar'da bo'ladi */}
        {!isMobile && (
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>
              <Text style={styles.logoS}>S</Text>
              <Text style={styles.logoMail}>mail</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Search Input - Centered */}
      <View style={styles.centerContainer}>
        <View style={[
          styles.searchContainer,
          searchFocused && styles.searchContainerFocused
        ]}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search mail"
            value={searchValue}
            onChangeText={setSearchValue}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={[
              styles.searchIcon,
              searchFocused && styles.searchIconFocused
            ]}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User Profile - Far Right */}
      <View style={styles.rightSection}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => {
            console.log('Profile avatar clicked!');
            handleProfilePress();
          }}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          {!isMobile && (
            <Text style={styles.username}>{user?.name || user?.username}</Text>
          )}
        </TouchableOpacity>

        {/* Profile Menu */}
        {profileMenuVisible && (
          <View style={styles.profileMenu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleProfileMenuAction('profile')}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>プロフィール</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleProfileMenuAction('statistics')}
            >
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={styles.menuText}>統計</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleProfileMenuAction('accounts')}
            >
              <Text style={styles.menuIcon}>👥</Text>
              <Text style={styles.menuText}>アカウント ({accounts.length})</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                console.log('Sign Out button pressed!');
                handleProfileMenuAction('logout');
              }}
            >
              <Text style={styles.menuIcon}>🚪</Text>
              <Text style={[styles.menuText, styles.logoutText]}>サインアウト</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Account Switcher Modal */}
      <Modal
        visible={accountSwitcherVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAccountSwitcherVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👥 Switch Account</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setAccountSwitcherVisible(false)}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.accountsList}>
              {accounts.map((account) => (
                <View key={account.id} style={styles.accountItem}>
                  <TouchableOpacity 
                    style={[styles.accountButton, account.id === user?.id && styles.currentAccount]}
                    onPress={() => handleSwitchAccount(account)}
                  >
                    <View style={styles.accountInfo}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {account.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                      </View>
                      <View style={styles.accountDetails}>
                        <Text style={styles.accountName}>{account.name}</Text>
                        <Text style={styles.accountEmail}>{account.email}</Text>
                        {account.id === user?.id && (
                          <Text style={styles.currentBadge}>✓ Current</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  {account.id !== user?.id && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveAccount(account.id)}
                    >
                      <Text style={styles.removeText}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.addAccountButton}
                onPress={handleAddAnotherAccount}
              >
                <Text style={styles.addAccountIcon}>➕</Text>
                <Text style={styles.addAccountText}>Add Another Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeConfirmation}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{confirmationTitle}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeConfirmation}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.confirmationContent}>
              <Text style={styles.confirmationMessage}>
                {confirmationMessage}
              </Text>
              
              <View style={styles.confirmationButtons}>
                {confirmationOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.confirmationButton,
                      option.style === 'cancel' && styles.cancelConfirmButton,
                      option.style === 'destructive' && styles.destructiveConfirmButton,
                      option.style === 'primary' && styles.primaryConfirmButton
                    ]}
                    onPress={option.onPress}
                  >
                    <Text style={[
                      styles.confirmationButtonText,
                      option.style === 'cancel' && styles.cancelConfirmButtonText,
                      option.style === 'destructive' && styles.destructiveConfirmButtonText,
                      option.style === 'primary' && styles.primaryConfirmButtonText
                    ]}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message Modal */}
      <Modal
        visible={messageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMessage}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.messageModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{messageTitle}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeMessage}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.messageContent}>
              <Text style={styles.messageText}>
                {messageText}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.messageButton,
                  messageType === 'success' && styles.successMessageButton,
                  messageType === 'error' && styles.errorMessageButton,
                  messageType === 'info' && styles.infoMessageButton
                ]}
                onPress={closeMessage}
              >
                <Text style={[
                  styles.messageButtonText,
                  messageType === 'success' && styles.successMessageButtonText,
                  messageType === 'error' && styles.errorMessageButtonText,
                  messageType === 'info' && styles.infoMessageButtonText
                ]}>
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2FA Verification Modal */}
      <Modal
        visible={twoFactorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancel2FA}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.twoFactorModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔐 二段階認証</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={cancel2FA}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.twoFactorContent}>
              <Text style={styles.twoFactorMessage}>
                サインアウトを確認するために2FAコードを入力してください
              </Text>
              
              <TextInput
                style={styles.twoFactorInput}
                placeholder="6桁のコードを入力"
                value={twoFactorCode}
                onChangeText={setTwoFactorCode}
                keyboardType="numeric"
                maxLength={6}
                placeholderTextColor="#999"
                autoFocus={true}
              />
              
              <View style={styles.twoFactorButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={cancel2FA}
                  disabled={isVerifying}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
                  onPress={handle2FAVerification}
                  disabled={isVerifying}
                >
                  <Text style={styles.verifyButtonText}>
                    {isVerifying ? '確認中...' : '確認してサインアウト'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.demoHint}>
                デモ: コード "123456" または任意の6桁の数字を使用
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  // Status Bar - faqat Android uchun telefon ma'lumotlari
  statusBar: {
    height: 27,
    backgroundColor: '#0000cc',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1002,          // TopBar'dan yuqori
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Platform.OS === 'android' ? colors.surface + '80' : colors.surface, // Android'da transparent, web'da normal
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 12,         // Android'da status bar uchun joy, web'da normal
    minHeight: Platform.OS === 'android' ? 30 : 10,          // Android'da balandroq, web'da normal
    zIndex: 1001,           // Higher than floating sidebar
    width: '100%',
    position: 'absolute',   // Fixed o'rniga absolute
    top: Platform.OS === 'android' ? 27 : 0,                // Android'da status bar'dan keyin (27px), web'da yuqoridan
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,           // Android uchun shadow
  },
  topbarMobile: {
    padding: 12,
  },
  menuToggle: {
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerIcon: {
    width: 20,
    height: 16,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
  },
  menuIcon: {
    fontSize: 20,
    color: '#333',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginLeft: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoS: {
    color: '#CC0000', // Google Red
    fontSize: 26,
    fontWeight: 'bold',
  },
  logoMail: {
    color: '#0000CC', // Google Blue
    fontSize: 24,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    transition: 'all 0.2s ease',
    minHeight: 36,
  },
  searchContainerFocused: {
    backgroundColor: '#ffffff',
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    transform: [{ scale: 1.01 }],
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    outline: 'none',
    fontWeight: '400',
    height: 24,
    lineHeight: 24,
    border: 'none',
    background: 'transparent',
    // Web-specific properties to remove all outlines
    ...(Platform.OS === 'web' && {
      outlineStyle: 'none',
      outlineWidth: 0,
      borderStyle: 'none',
      borderWidth: 0,
      boxShadow: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
    }),
  },
  searchButton: {
    padding: 4,
    borderRadius: 8,
    marginLeft: 6,
  },
  searchIcon: {
    fontSize: 16,
    color: '#999',
    transition: 'color 0.2s ease',
  },
  searchIconFocused: {
    color: colors.primary,
  },
  rightSection: {
    position: 'relative',
    marginLeft: 16,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  username: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  profileMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  logoutText: {
    color: colors.danger,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 450,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: '#666',
  },
  accountsList: {
    maxHeight: 300,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentAccount: {
    backgroundColor: '#e8f4fd',
    borderColor: colors.primary,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  currentBadge: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  removeButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  removeText: {
    fontSize: 16,
  },
  modalFooter: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
  },
  addAccountIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  addAccountText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Confirmation Modal Styles
  confirmationModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  confirmationContent: {
    alignItems: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  confirmationButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelConfirmButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryConfirmButton: {
    backgroundColor: '#007AFF',
  },
  destructiveConfirmButton: {
    backgroundColor: '#FF3B30',
  },
  confirmationButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelConfirmButtonText: {
    color: '#333',
  },
  primaryConfirmButtonText: {
    color: 'white',
  },
  destructiveConfirmButtonText: {
    color: 'white',
  },
  
  // Message Modal Styles
  messageModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  messageContent: {
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  messageButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  successMessageButton: {
    backgroundColor: '#28A745',
  },
  errorMessageButton: {
    backgroundColor: '#DC3545',
  },
  infoMessageButton: {
    backgroundColor: '#007AFF',
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  successMessageButtonText: {
    color: 'white',
  },
  errorMessageButtonText: {
    color: 'white',
  },
  infoMessageButtonText: {
    color: 'white',
  },
  
  // 2FA Modal Styles
  twoFactorModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  twoFactorContent: {
    alignItems: 'center',
  },
  twoFactorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  twoFactorInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '600',
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
  },
  twoFactorButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  demoHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default TopBar;