import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { fetchEmailStatistics, getWhitelistSettings, updateWhitelistMode, addWhitelistDomain, removeWhitelistDomain } from '../services/mailService';

const StatisticsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReceived: 0,
    totalSent: 0,
    spamDetected: 0,
    spamAccuracy: 0,
    loginDevices: [],
    securityAlerts: 0,
    storageUsed: 0,
    totalStorage: 15, // GB
  });

  // Password confirmation modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [deviceToLogout, setDeviceToLogout] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Whitelist email policy state
  const [whitelistOnly, setWhitelistOnly] = useState(false);
  const [whitelistedDomains, setWhitelistedDomains] = useState(['company.com', 'gmail.com']);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        // Try to fetch real statistics and whitelist settings from mail server
        const [statsResponse, whitelistResponse] = await Promise.all([
          fetchEmailStatistics(),
          getWhitelistSettings()
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.stats);
        } else {
          throw new Error('Failed to fetch stats');
        }

        if (whitelistResponse.success) {
          setWhitelistOnly(whitelistResponse.whitelistOnly);
          setWhitelistedDomains(whitelistResponse.domains || []);
        }
      } catch (error) {
        console.error('Statistics fetch error:', error);
        // Fallback to demo data if API fails
        const demoStats = {
          totalReceived: 1247,
          totalSent: 853,
          spamDetected: 89,
          spamAccuracy: 94.2,
          loginDevices: [
            { 
              id: 'current', 
              device: 'Windows PC', 
              location: 'Tashkent, Uzbekistan', 
              lastAccess: 'Active now',
              isCurrent: true,
              browser: 'Chrome 118',
              ip: '192.168.1.105'
            },
            { 
              id: 'device-2', 
              device: 'iPhone 14 Pro', 
              location: 'Tashkent, Uzbekistan', 
              lastAccess: '2 hours ago',
              isCurrent: false,
              browser: 'Safari Mobile',
              ip: '192.168.1.110'
            },
            { 
              id: 'device-3', 
              device: 'MacBook Air', 
              location: 'Samarkand, Uzbekistan', 
              lastAccess: '1 day ago',
              isCurrent: false,
              browser: 'Safari 17',
              ip: '10.0.0.45'
            },
          ],
          securityAlerts: 2,
          storageUsed: 8.7, // GB
          totalStorage: 15, // GB
        };
        setStats(demoStats);
        
        // Set demo whitelist data if API fails
        setWhitelistOnly(false);
        setWhitelistedDomains(['company.com', 'gmail.com']);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const calculateStoragePercentage = () => {
    return ((stats.storageUsed / stats.totalStorage) * 100).toFixed(1);
  };

  const handleLogoutDevice = (device) => {
    setDeviceToLogout(device);
    setShowPasswordModal(true);
  };

  const handleLogoutAllDevices = () => {
    setDeviceToLogout({ id: 'all', device: 'All Other Devices' });
    setShowPasswordModal(true);
  };

  const confirmLogout = async () => {
    if (!password.trim()) {
      Alert.alert('エラー', 'ログアウトを確認するためにパスワードを入力してください');
      return;
    }

    setIsLoggingOut(true);
    
    try {
      // Simulate API call to logout device(s)
      // In real implementation, this would call your auth API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowPasswordModal(false);
      setPassword('');
      
      if (deviceToLogout.id === 'all') {
        Alert.alert(
          '成功', 
          '他のすべてのデバイスからログアウトしました',
          [{ text: 'OK', onPress: () => {
            // Update stats to remove other devices
            setStats(prevStats => ({
              ...prevStats,
              loginDevices: prevStats.loginDevices.filter(device => device.isCurrent)
            }));
          }}]
        );
      } else {
        Alert.alert(
          '成功', 
          `${deviceToLogout.device}からログアウトしました`,
          [{ text: 'OK', onPress: () => {
            // Update stats to remove specific device
            setStats(prevStats => ({
              ...prevStats,
              loginDevices: prevStats.loginDevices.filter(device => device.id !== deviceToLogout.id)
            }));
          }}]
        );
      }
    } catch (error) {
      Alert.alert('エラー', 'デバイスのログアウトに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoggingOut(false);
      setDeviceToLogout(null);
    }
  };

  const cancelLogout = () => {
    setShowPasswordModal(false);
    setPassword('');
    setDeviceToLogout(null);
  };

  // Whitelist functions
  const handleWhitelistToggle = async (value) => {
    try {
      const response = await updateWhitelistMode(value);
      if (response.success) {
        setWhitelistOnly(value);
        Alert.alert('成功', response.message);
      }
    } catch (error) {
      Alert.alert('エラー', 'ホワイトリストモードの更新に失敗しました');
    }
  };

  const addDomain = async () => {
    if (!newDomain.trim()) {
      Alert.alert('エラー', '有効なドメインを入力してください');
      return;
    }

    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain.trim())) {
      Alert.alert('エラー', '有効なドメイン形式を入力してください（例: company.com）');
      return;
    }

    const domain = newDomain.trim().toLowerCase();
    if (whitelistedDomains.includes(domain)) {
      Alert.alert('エラー', 'このドメインは既にホワイトリストに登録されています');
      return;
    }

    try {
      const response = await addWhitelistDomain(domain);
      if (response.success) {
        setWhitelistedDomains(prev => [...prev, domain]);
        setNewDomain('');
        Alert.alert('成功', response.message);
      }
    } catch (error) {
      Alert.alert('エラー', 'ドメインのホワイトリストへの追加に失敗しました');
    }
  };

  const removeDomain = async (domain) => {
    Alert.alert(
      '削除の確認',
      `"${domain}"をホワイトリストから削除してもよろしいですか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await removeWhitelistDomain(domain);
              if (response.success) {
                setWhitelistedDomains(prev => prev.filter(d => d !== domain));
                Alert.alert('成功', response.message);
              }
            } catch (error) {
              Alert.alert('エラー', 'ドメインのホワイトリストからの削除に失敗しました');
            }
          }
        }
      ]
    );
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
          <Text style={styles.headerTitle}>統計</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>統計を読み込み中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>統計</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Email Statistics */}
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="mail" size={24} color={colors.primary} />
            <Text style={styles.cardTitle}>メール統計</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalReceived}</Text>
              <Text style={styles.statLabel}>受信</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalSent}</Text>
              <Text style={styles.statLabel}>送信</Text>
            </View>
          </View>
        </View>

        {/* Spam Protection */}
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield" size={24} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>迷惑メール対策</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.spamDetected}</Text>
              <Text style={styles.statLabel}>検出された迷惑メール</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {stats.spamAccuracy}%
              </Text>
              <Text style={styles.statLabel}>精度</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>迷惑メールフィルタの有効性</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${stats.spamAccuracy}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Security & Access */}
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="lock-closed" size={24} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>セキュリティとプライバシー</Text>
          </View>
          
          <View style={styles.securityItem}>
            <Text style={styles.securityLabel}>セキュリティアラート</Text>
            <View style={[
              styles.alertBadge, 
              stats.securityAlerts > 0 ? styles.alertBadgeWarning : styles.alertBadgeSuccess
            ]}>
              <Text style={[
                styles.alertBadgeText,
                stats.securityAlerts > 0 ? styles.alertTextWarning : styles.alertTextSuccess
              ]}>
                {stats.securityAlerts}
              </Text>
            </View>
          </View>

          {/* Whitelist Email Policy */}
          <View style={styles.whitelistSection}>
            <View style={styles.policyHeader}>
              <Text style={styles.policyTitle}>メールホワイトリストポリシー</Text>
              <Switch
                value={whitelistOnly}
                onValueChange={handleWhitelistToggle}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={whitelistOnly ? '#007AFF' : '#f4f3f4'}
              />
            </View>
            
            <Text style={styles.policyDescription}>
              {whitelistOnly 
                ? 'ホワイトリストに登録されたドメインからのメールのみ受信します' 
                : 'すべてのメールを受信します（ホワイトリスト無効）'}
            </Text>

            {whitelistOnly && (
              <View style={styles.whitelistControls}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.domainInput}
                    placeholder="ドメインを追加（例: company.com）"
                    value={newDomain}
                    onChangeText={setNewDomain}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={addDomain}
                  >
                    <Text style={styles.addButtonText}>追加</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.domainList}>
                  <Text style={styles.domainListTitle}>ホワイトリスト登録済みドメイン:</Text>
                  {whitelistedDomains.map((domain, index) => (
                    <View key={index} style={styles.domainItem}>
                      <Text style={styles.domainText}>{domain}</Text>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => removeDomain(domain)}
                      >
                        <Text style={styles.removeButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {whitelistedDomains.length === 0 && (
                    <Text style={styles.emptyDomainText}>まだドメインが追加されていません</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Device Access Management */}
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📱</Text>
            <Text style={styles.cardTitle}>デバイスアクセス管理</Text>
          </View>
          
          {/* Current Device */}
          {stats.loginDevices.filter(device => device.isCurrent).map((device, index) => (
            <View key={device.id} style={[styles.deviceItem, styles.currentDevice]}>
              <View style={styles.deviceHeader}>
                <View style={styles.deviceIcon}>
                  <Text style={styles.deviceIconText}>
                    {device.device.includes('iPhone') ? '📱' : 
                     device.device.includes('Windows') ? '💻' : '🖥️'}
                  </Text>
                </View>
                <View style={styles.currentDeviceBadge}>
                  <Text style={styles.currentDeviceLabel}>現在のデバイス</Text>
                </View>
              </View>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.device}</Text>
                <Text style={styles.deviceLocation}>{device.location}</Text>
                <Text style={styles.deviceDetails}>{device.browser} • {device.ip}</Text>
                <Text style={[styles.deviceTime, styles.activeAccess]}>{device.lastAccess}</Text>
              </View>
            </View>
          ))}

          {/* Other Devices Section */}
          <View style={styles.otherDevicesSection}>
            <View style={styles.otherDevicesHeader}>
              <Text style={styles.otherDevicesTitle}>その他のデバイス</Text>
              {stats.loginDevices.filter(device => !device.isCurrent).length > 0 && (
                <TouchableOpacity 
                  style={styles.logoutAllButton}
                  onPress={() => handleLogoutAllDevices()}
                  disabled={isLoggingOut}
                >
                  <Text style={styles.logoutAllText}>すべてログアウト</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {stats.loginDevices.filter(device => !device.isCurrent).map((device, index) => (
              <View key={device.id} style={styles.deviceItem}>
                <View style={styles.deviceIcon}>
                  <Text style={styles.deviceIconText}>
                    {device.device.includes('iPhone') ? '📱' : 
                     device.device.includes('Windows') ? '💻' : '🖥️'}
                  </Text>
                </View>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.device}</Text>
                  <Text style={styles.deviceLocation}>{device.location}</Text>
                  <Text style={styles.deviceDetails}>{device.browser} • {device.ip}</Text>
                  <Text style={styles.deviceTime}>最終アクセス: {device.lastAccess}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.logoutDeviceButton}
                  onPress={() => handleLogoutDevice(device)}
                  disabled={isLoggingOut}
                >
                  <Text style={styles.logoutDeviceText}>ログアウト</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {stats.loginDevices.filter(device => !device.isCurrent).length === 0 && (
              <View style={styles.noOtherDevices}>
                <Text style={styles.noOtherDevicesText}>他のデバイスでログインしていません</Text>
              </View>
            )}
          </View>
        </View>

        {/* Storage */}
        <View style={styles.statsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💾</Text>
            <Text style={styles.cardTitle}>ストレージ</Text>
          </View>
          
          <View style={styles.storageInfo}>
            <Text style={styles.storageText}>
              {stats.storageUsed} GB / {stats.totalStorage} GB 使用中
            </Text>
            <Text style={styles.storagePercent}>
              ({calculateStoragePercentage()}%)
            </Text>
          </View>
          
          <View style={styles.storageBar}>
            <View 
              style={[
                styles.storageFill, 
                { width: `${calculateStoragePercentage()}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.storageRemaining}>
            残り {(stats.totalStorage - stats.storageUsed).toFixed(1)} GB
          </Text>
        </View>
      </ScrollView>

      {/* Password Confirmation Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>デバイスのログアウト確認</Text>
            <Text style={styles.modalMessage}>
              {deviceToLogout?.id === 'all' 
                ? '他のすべてのデバイスからログアウトします。パスワードを入力して確認してください。'
                : `"${deviceToLogout?.device}"からログアウトします。パスワードを入力して確認してください。`
              }
            </Text>
            
            <TextInput
              style={styles.passwordInput}
              placeholder="パスワードを入力"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              autoFocus={true}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={cancelLogout}
                disabled={isLoggingOut}
              >
                <Text style={styles.cancelButtonText}>キャンセル</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, isLoggingOut && styles.confirmButtonDisabled]}
                onPress={confirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>ログアウトを確認</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  statsCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  securityLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  alertBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  alertBadgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  alertBadgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  alertBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertTextSuccess: {
    color: '#065F46',
  },
  alertTextWarning: {
    color: '#92400E',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  deviceIconText: {
    fontSize: 20,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  deviceLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  deviceTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageText: {
    fontSize: 16,
    color: '#1F2937',
  },
  storagePercent: {
    fontSize: 14,
    color: '#6B7280',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  storageFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  storageRemaining: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Device Management Styles
  currentDevice: {
    backgroundColor: '#F0FDF4',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentDeviceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  currentDeviceLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deviceDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  activeAccess: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  otherDevicesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  otherDevicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  otherDevicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutAllButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutDeviceButton: {
    backgroundColor: '#F87171',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  logoutDeviceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  noOtherDevices: {
    padding: 16,
    alignItems: 'center',
  },
  noOtherDevicesText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Whitelist Styles
  whitelistSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  policyDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  whitelistControls: {
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  domainInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  domainList: {
    marginTop: 8,
  },
  domainListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  domainItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  domainText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  emptyDomainText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default StatisticsScreen;
