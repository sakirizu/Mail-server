import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../styles/theme';

const DeviceManagementScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/auth/devices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setDevices(data.devices);
      } else {
        Alert.alert('Xatolik', data.error || 'Qurilmalarni yuklab bo\'lmadi');
      }
    } catch (error) {
      console.error('Load devices error:', error);
      Alert.alert('Xatolik', 'Serverga ulanishda xatolik');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDevices();
  };

  const removeDevice = async (deviceId, deviceInfo) => {
    Alert.alert(
      'Qurilmani O\'chirish',
      `${deviceInfo.browser_name} ${deviceInfo.browser_version} (${deviceInfo.os_name}) qurilmasini o'chirishni xohlaysizmi?`,
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { 
          text: 'O\'chirish', 
          style: 'destructive',
          onPress: () => performDeviceRemoval(deviceId)
        }
      ]
    );
  };

  const performDeviceRemoval = async (deviceId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/auth/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setDevices(devices.filter(device => device.id !== deviceId));
        Alert.alert('Muvaffaqiyat', 'Qurilma muvaffaqiyatli o\'chirildi');
      } else {
        Alert.alert('Xatolik', data.error || 'Qurilmani o\'chirib bo\'lmadi');
      }
    } catch (error) {
      console.error('Remove device error:', error);
      Alert.alert('Xatolik', 'Serverga ulanishda xatolik');
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return '📱';
      case 'tablet':
        return '📱';
      case 'desktop':
        return '🖥️';
      default:
        return '💻';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Qurilmalar</Text>
        <Text style={styles.subtitle}>
          Hisobingizga kirgan barcha qurilmalar
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>🔒 Xavfsizlik Ma'lumoti</Text>
        <Text style={styles.infoText}>
          Bu ro'yxatda hisobingizga kirgan barcha qurilmalar ko'rsatilgan. 
          Agar tanimagan qurilma ko'rsangiz, uni o'chirib tashlang va parolingizni o'zgartiring.
        </Text>
      </View>

      {devices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Hech qanday qurilma topilmadi</Text>
        </View>
      ) : (
        devices.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <View style={styles.deviceIconContainer}>
                <Text style={styles.deviceIcon}>
                  {getDeviceIcon(device.device_type)}
                </Text>
              </View>
              <View style={styles.deviceMainInfo}>
                <Text style={styles.deviceName}>
                  {device.browser_name} {device.browser_version}
                </Text>
                <Text style={styles.deviceOS}>
                  {device.os_name} {device.os_version}
                </Text>
                <Text style={styles.deviceType}>
                  {device.device_type} • {device.timezone}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeDevice(device.id, device)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>

            <View style={styles.deviceDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>IP Manzil:</Text>
                <Text style={styles.detailValue}>{device.ip_address}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Til:</Text>
                <Text style={styles.detailValue}>{device.language}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Oxirgi foydalanish:</Text>
                <Text style={styles.detailValue}>{formatDate(device.last_used)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Birinchi kirish:</Text>
                <Text style={styles.detailValue}>{formatDate(device.created_at)}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Orqaga</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 204, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    margin: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  deviceCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceIcon: {
    fontSize: 24,
  },
  deviceMainInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  deviceOS: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  deviceType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  removeButtonText: {
    fontSize: 18,
  },
  deviceDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  backButton: {
    backgroundColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DeviceManagementScreen;