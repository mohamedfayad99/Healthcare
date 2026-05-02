import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, SafeAreaView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import localApiService from '../api/localApiService';
import Toast from 'react-native-root-toast';
import { getPositionByLabel } from '../constants/positions';
import { Ionicons } from '@expo/vector-icons';

export default function PatientsScreen({ navigation }) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [userAuthInfo, setUserAuthInfo] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const parseDate = (d) => {
    if (!d) return new Date();
    return d.endsWith('Z') ? new Date(d) : new Date(d + 'Z');
  };

  const fetchPatients = async () => {
    try {
      const response = await localApiService.getPatients();
      setPatients(response.data);
      
      const hasPatientsNeedingRotation = response.data.some(p => {
        if (!p.lastPositionLog) return true;
        const diffHours = (new Date() - parseDate(p.lastPositionLog.changedAt)) / 3600000;
        return diffHours > 2;
      });
      setHasNewNotification(hasPatientsNeedingRotation);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPatients();
      fetchMe();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchMe = async () => {
    try {
      const res = await localApiService.getMe();
      setUserAuthInfo(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const notifyIfNeeded = () => {
      const needsMoveCount = patients.filter(p => {
        if (!p.lastPositionLog) return true;
        const diffHours = (new Date() - parseDate(p.lastPositionLog.changedAt)) / 3600000;
        return diffHours > 2;
      }).length;

      if (needsMoveCount > 0) {
        setHasNewNotification(true);
        Toast.show(`تنبيه: حان وقت تغيير وضعية ${needsMoveCount} مريض!`, {
          duration: Toast.durations.LONG,
          position: Toast.positions.TOP,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor: '#e74c3c'
        });
      }
    };

    if (patients.length > 0) {
      // Remove automatic notifyIfNeeded() from here to prevent toast spam every refresh.
      // It will now only run every 2 hours via the toastInterval below.

      const interval = setInterval(fetchPatients, 10000); 
      
      const toastInterval = setInterval(() => {
        setHasNewNotification(true);
        notifyIfNeeded();
        Toast.show(`تذكير عام: تفقد المرضى!`, {
          duration: Toast.durations.LONG,
          position: Toast.positions.TOP,
          backgroundColor: '#007AFF'
        });
      }, 7200000); // 2 hours

      return () => {
        clearInterval(interval);
        clearInterval(toastInterval);
      };
    }
  }, [patients]);

  const getTimeElapsed = (dateString) => {
    if (!dateString) return '';
    const diff = new Date() - parseDate(dateString);
    const minutes = Math.floor(diff / 60000);
    if (minutes > 60) {
      return `${Math.floor(minutes / 60)} ساعة`;
    }
    return `${minutes} دقيقة`;
  };

  const getStatusColor = (lastLog) => {
    if (!lastLog) return '#F2994A'; 
    const diffHours = (new Date() - parseDate(lastLog.changedAt)) / 3600000;
    if (diffHours > 2) return '#F2994A'; 
    return '#27AE60'; 
  };

  const getStatusText = (lastLog) => {
    if (!lastLog) return t('needs_change');
    const diffHours = (new Date() - parseDate(lastLog.changedAt)) / 3600000;
    if (diffHours > 2) return t('needs_change');
    return t('changed');
  };

  const renderItem = ({ item }) => {
    const color = getStatusColor(item.lastPositionLog);
    const elapsed = item.lastPositionLog ? getTimeElapsed(item.lastPositionLog.changedAt) : '';
    const pos = item.lastPositionLog ? getPositionByLabel(item.lastPositionLog.targetPosition) : null;
    const posLabel = pos ? t(pos.labelKey) : (item.lastPositionLog ? item.lastPositionLog.targetPosition : t('needs_change'));

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('PatientDetails', { patientId: item.id })}
      >
        <View style={styles.cardContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.fullName}</Text>
            <Text style={styles.subtext}>{item.department}</Text>
            <Text style={styles.subtext}>{t('bed_number')}: {item.bedNumber}</Text>
          </View>
          <View style={styles.status}>
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
               <Text style={[styles.badgeText, { color }]}>{posLabel}</Text>
            </View>
            {item.lastPositionLog && <Text style={styles.sinceText}>{t('since')} {elapsed}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerWelcome}>{t('welcome') || 'مرحباً'}،</Text>
          <Text style={styles.headerName}>
            {userAuthInfo ? userAuthInfo.username.split(' ')[0] : '...'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('About')} 
            style={styles.headerIconButton}
          >
            <Ionicons name="information-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { 
                const needMove = patients.filter(p => {
                if (!p.lastPositionLog) return true;
                const diffHours = (new Date() - parseDate(p.lastPositionLog.changedAt)) / 3600000;
                return diffHours > 2;
              });
                
                if (needMove.length === 0) {
                    Alert.alert('الإشعارات', 'كل المريض في وضعية جيدة حالياً');
                } else {
                    const names = needMove.map(p => p.fullName).join('\n- ');
                    Alert.alert('تنبيه هام', `المرضى التاليين يحتاجون لتغيير الوضعية فوراً:\n- ${names}`);
                }
            }} 
            style={styles.bellContainer}
          >
            <Ionicons name="notifications" size={24} color="#007AFF" />
            {patients.filter(p => {
              if (!p.lastPositionLog) return true;
              const diffHours = (new Date() - parseDate(p.lastPositionLog.changedAt)) / 3600000;
              return diffHours > 2;
            }).length > 0 && (
              <View style={styles.redDot}>
                <Text style={styles.badgeNumberText}>
                  {patients.filter(p => {
                    if (!p.lastPositionLog) return true;
                    const diffHours = (new Date() - parseDate(p.lastPositionLog.changedAt)) / 3600000;
                    return diffHours > 2;
                  }).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={{ marginRight: 10 }} />
        <TextInput 
          style={styles.searchInput}
          placeholder={t('search_patient')}
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>
      <FlatList
        data={patients.filter(p => (p.fullName || '').includes(search))}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab} onPress={() => navigation.navigate('Profile')}>
          {userAuthInfo?.profileImage ? (
            <Image source={{ uri: userAuthInfo.profileImage }} style={styles.footerAvatar} />
          ) : (
            <Ionicons name="person" size={24} color="#007AFF" />
          )}
          <Text style={styles.footerText}>الحساب</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerTab} onPress={() => { fetchPatients(); fetchMe(); }}>
          <View style={styles.homeIconContainer}>
            <Ionicons name="home" size={24} color="#fff" />
          </View>
          <Text style={styles.footerTextActive}>الرئيسية</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerTab} onPress={() => navigation.navigate('AddPatient')}>
          <Ionicons name="add-circle" size={32} color="#007AFF" />
          <Text style={styles.footerText}>إضافة</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  headerLeft: { alignItems: 'flex-start' },
  headerWelcome: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  headerName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIconButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  bellContainer: { 
    backgroundColor: '#fff', 
    padding: 10, 
    borderRadius: 12, 
    marginRight: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  notificationIcon: { fontSize: 20, color: '#007AFF' },
  redDot: { 
    position: 'absolute', 
    top: -5, 
    right: -5, 
    backgroundColor: '#e74c3c', 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeNumberText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold'
  },
  avatarHeader: { 
    width: 44, 
    height: 44, 
    borderRadius: 15, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  avatarHeaderImage: { width: '100%', height: '100%' },
  avatarHeaderText: { fontSize: 22 },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -25,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  searchIcon: { fontSize: 18, marginRight: 10, color: '#8E8E93' },
  searchInput: { flex: 1, fontSize: 16, color: '#3A3A3C' },
  list: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F2F2F7'
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 55, height: 55, borderRadius: 18,
    backgroundColor: '#E5F1FF', justifyContent: 'center', alignItems: 'center',
    marginRight: 15
  },
  avatarIcon: { fontSize: 30 },
  info: { flex: 1, alignItems: 'flex-start' },
  name: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  subtext: { fontSize: 13, color: '#8E8E93', textAlign: 'left' },
  status: { alignItems: 'flex-end', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginBottom: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  sinceText: { fontSize: 11, color: '#AEAEB2' },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    height: 70,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    paddingHorizontal: 10
  },
  footerTab: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  footerIcon: { fontSize: 22, color: '#007AFF', marginBottom: 4 },
  footerIconHome: { fontSize: 24, color: '#fff' },
  homeIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -15,
    marginTop: -30,
    borderWidth: 5,
    borderColor: '#F8F9FB',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  footerText: { fontSize: 10, color: '#8E8E93', fontWeight: '500' },
  footerTextActive: { fontSize: 10, color: '#007AFF', fontWeight: '700', marginTop: 15 },
  footerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 4
  }
});
