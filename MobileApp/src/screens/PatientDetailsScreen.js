import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import localApiService from '../api/localApiService';

import { PATIENT_POSITIONS, getPositionByLabel } from '../constants/positions';
import { Image } from 'react-native';

export default function PatientDetailsScreen({ route, navigation }) {
  const { patientId } = route.params;
  const { t } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [lastLog, setLastLog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPatientDetails = async () => {
    try {
      const response = await localApiService.getPatientById(patientId);
      setPatient(response.data.patient);
      setLastLog(response.data.lastPositionLog);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPatientDetails();
    });
    return unsubscribe;
  }, [navigation]);

  const handleDelete = () => {
    Alert.alert(
      t('alert') || 'تأكيد',
      'هل أنت متأكد من حذف هذا المريض؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: async () => {
            try {
              await localApiService.deletePatient(patientId);
              navigation.goBack();
            } catch (error) {
              console.error(error);
              Alert.alert('خطأ', 'تعذر حذف المريض');
            }
          }
        }
      ]
    );
  };

  const parseDate = (d) => {
    if (!d) return new Date();
    return d.endsWith('Z') ? new Date(d) : new Date(d + 'Z');
  };

  const getTimeElapsed = (dateString) => {
    if (!dateString) return '';
    const diff = new Date() - parseDate(dateString);
    const minutes = Math.floor(diff / 60000);
    if (minutes > 60) {
      return `${Math.floor(minutes / 60)} ساعة`;
    }
    return `${minutes} دقيقة`;
  };

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{flex: 1, justifyContent: 'center'}} />;
  if (!patient) return <Text>Error loading patient</Text>;

  const currentPos = lastLog ? getPositionByLabel(lastLog.targetPosition) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>❮</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('patient_details')}</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>🛌</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{patient.fullName}</Text>
            <Text style={styles.subtext}>{t('bed_number')}: {patient.bedNumber}</Text>
            <Text style={styles.subtext}>{patient.department}</Text>
          </View>
        </View>

        {currentPos && (
          <View style={styles.currentPositionFullCard}>
             <Text style={styles.sectionTitleCenter}>{t('current_position')}</Text>
             <View style={styles.illustrationContainer}>
                <Image source={currentPos.image} style={styles.currentIllustration} resizeMode="contain" />
             </View>
             <Text style={styles.positionNameLabel}>{t(currentPos.labelKey)}</Text>
             <Text style={styles.timeElapsedText}>{lastLog ? `${t('since')} ${getTimeElapsed(lastLog.changedAt)}` : ''}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>معلومات المريض</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>{t('age')}</Text>
            <Text style={styles.infoValue}>{patient.age} {t('years')}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>{t('status')}</Text>
            <Text style={styles.infoValue}>{patient.mobilityStatus}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.changePositionButton}
          onPress={() => navigation.navigate('PositionChange', { patientId: patient.id, patientName: patient.fullName, bedNumber: patient.bedNumber })}
        >
          <Text style={styles.changePositionButtonText}>{t('change_position_now')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.changePositionButton, { backgroundColor: '#0050A0', marginTop: 0 }]}
          onPress={() => navigation.navigate('FollowUp', { patientId: patient.id })}
        >
          <Text style={styles.changePositionButtonText}>{t('follow_up_record')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.changePositionButton, { backgroundColor: '#e74c3c', marginTop: 0, marginBottom: 40 }]}
          onPress={handleDelete}
        >
          <Text style={styles.changePositionButtonText}>حذف المريض</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: { padding: 5, width: 40 },
  backButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  profileCard: {
    backgroundColor: '#fff', flexDirection: 'row', padding: 20, alignItems: 'center',
    margin: 15, borderRadius: 12, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: {width: 0, height: 2}
  },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#82C0FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarIcon: { fontSize: 30 },
  profileInfo: { flex: 1, alignItems: 'flex-start' },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'left' },
  subtext: { fontSize: 14, color: '#666', marginTop: 2, textAlign: 'left' },
  currentPositionFullCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  sectionTitleCenter: { fontSize: 14, color: '#007AFF', fontWeight: 'bold', marginBottom: 15 },
  illustrationContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden'
  },
  currentIllustration: { width: '100%', height: '100%' },
  positionNameLabel: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  timeElapsedText: { fontSize: 14, color: '#666', marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 20, marginTop: 10, marginBottom: 10, textAlign: 'right' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 },
  infoBox: { backgroundColor: '#fff', flex: 0.48, padding: 15, borderRadius: 12, elevation: 2, alignItems: 'center' },
  infoLabel: { fontSize: 13, color: '#666', marginBottom: 5 },
  infoValue: { fontSize: 15, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  changePositionButton: { backgroundColor: '#007AFF', margin: 15, padding: 15, borderRadius: 12, alignItems: 'center' },
  changePositionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
