import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import Toast from 'react-native-root-toast';

export default function PatientsScreen({ navigation }) {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [userAuthInfo, setUserAuthInfo] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const fetchPatients = async () => {
    try {
      const response = await client.get('/patients');
      setPatients(response.data);
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
      const res = await client.get('/auth/me');
      setUserAuthInfo(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const notifyIfNeeded = () => {
      const needsMoveCount = patients.filter(p => {
        if (!p.lastPositionLog) return true;
        const diffHours = (new Date() - new Date(p.lastPositionLog.changedAt)) / 3600000;
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
      notifyIfNeeded();
      const interval = setInterval(fetchPatients, 10000); // refresh list every 10 sec automatically
      // Local notification every 2 hours:
      const toastInterval = setInterval(() => {
        setHasNewNotification(true);
        notifyIfNeeded();
        // Also just a general reminder every 2 hours
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
    const diff = new Date() - new Date(dateString);
    const minutes = Math.floor(diff / 60000);
    if (minutes > 60) {
      return `${Math.floor(minutes / 60)} ساعة`;
    }
    return `${minutes} دقيقة`;
  };

  const getStatusColor = (lastLog) => {
    if (!lastLog) return '#F2994A'; 
    const diffHours = (new Date() - new Date(lastLog.changedAt)) / 3600000;
    if (diffHours > 2) return '#F2994A'; 
    return '#27AE60'; 
  };

  const getStatusText = (lastLog) => {
    if (!lastLog) return t('needs_change');
    const diffHours = (new Date() - new Date(lastLog.changedAt)) / 3600000;
    if (diffHours > 2) return t('needs_change');
    return t('changed');
  };

  const renderItem = ({ item }) => {
    const color = getStatusColor(item.lastPositionLog);
    const statusText = getStatusText(item.lastPositionLog);
    const elapsed = item.lastPositionLog ? getTimeElapsed(item.lastPositionLog.changedAt) : '';

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
            <Text style={styles.subtext}>{t('bed_number')}: {item.bedNumber}</Text>
            <Text style={styles.subtext}>{item.department}</Text>
          </View>
          <View style={styles.status}>
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
               <Text style={[styles.badgeText, { color }]}>{statusText}</Text>
            </View>
            <Text style={styles.sinceText}>{t('since')} {elapsed}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerUserInfo}>
          <Text style={styles.headerName}>{userAuthInfo ? userAuthInfo.username : '...'}</Text>
          <TouchableOpacity onPress={() => { setHasNewNotification(false); Alert?.alert('الإشعارات', 'لا توجد إشعارات جديدة'); }} style={styles.bellContainer}>
            <Text style={styles.notificationIcon}>🔔</Text>
            {hasNewNotification && <View style={styles.redDot} />}
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>{t('patients_list')}</Text>
      </View>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
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

      <TouchableOpacity style={styles.profileFab} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.fabIcon}>👤</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddPatient')}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerUserInfo: { flexDirection: 'row', alignItems: 'center' },
  headerName: { color: '#fff', fontSize: 16, marginRight: 10, fontWeight: 'bold' },
  bellContainer: { position: 'relative' },
  notificationIcon: { fontSize: 24, color: '#fff' },
  redDot: { position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', borderWidth: 1, borderColor: '#fff' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  searchContainer: {
    flexDirection: 'row',
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  searchIcon: { fontSize: 20, marginRight: 10 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  list: { paddingHorizontal: 15, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#82C0FF', justifyContent: 'center', alignItems: 'center',
    marginRight: 15
  },
  avatarIcon: { fontSize: 24, color: '#fff' },
  info: { flex: 1, alignItems: 'flex-start' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtext: { fontSize: 12, color: '#666', textAlign: 'left' },
  status: { alignItems: 'flex-end', justifyContent: 'center' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginBottom: 5 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  sinceText: { fontSize: 10, color: '#999' },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5
  },
  profileFab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    left: 20,
    bottom: 20,
    backgroundColor: '#0050A0',
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5
  },
  fabIcon: {
    fontSize: 28,
    color: 'white',
    lineHeight: 30
  }
});
