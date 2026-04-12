import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import client from '../api/client';
import Toast from 'react-native-root-toast';
import { PATIENT_POSITIONS } from '../constants/positions';
import { schedulePositionChangeReminder } from '../api/notificationHelper';

export default function PositionChangeScreen({ route, navigation }) {
  const { patientId, patientName, bedNumber } = route.params;
  const { t } = useTranslation();
  const [selectedPosition, setSelectedPosition] = useState(null);

  const handleSavePosition = async () => {
    if (!selectedPosition) {
      Alert.alert(t('alert'), t('choose_suitable_position'));
      return;
    }

    try {
      const positionId = selectedPosition;
      await client.post(`/patients/${patientId}/positions`, { targetPosition: positionId });
      
      // Success Toast
      Toast.show('تم التغيير', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor: '#28A745',
      });

      // Schedule LOCAL notification for 2 hours later
      await schedulePositionChangeReminder(patientName, bedNumber);

      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert(t('alert'), 'Failed to save position');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
          <Text style={styles.backButtonText}>{"❮"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('position_options')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>🛡️</Text>
        <Text style={styles.infoText}>اختر الوضعية الموضحة في الصور لتجنب التقرحات</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {PATIENT_POSITIONS.map(pos => (
          <TouchableOpacity 
            key={pos.id} 
            style={[styles.positionCard, selectedPosition === pos.id && styles.selectedCard]}
            onPress={() => setSelectedPosition(pos.id)}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={pos.image} 
                style={styles.positionImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.positionLabel, selectedPosition === pos.id && styles.selectedLabel]}>
              {t(pos.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.saveButton, !selectedPosition && { opacity: 0.5 }]} 
        onPress={handleSavePosition}
        disabled={!selectedPosition}
      >
        <Text style={styles.saveButtonText}>{t('done_change')}</Text>
      </TouchableOpacity>
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
  infoBanner: {
    backgroundColor: '#E0F0FF',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: '#B0D8FF'
  },
  infoText: { color: '#0050A0', marginRight: 10, fontWeight: 'bold', fontSize: 13, textAlign: 'right', flex: 1 },
  infoIcon: { fontSize: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 100
  },
  positionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#E0F0FF'
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden'
  },
  positionImage: {
    width: '100%',
    height: '100%',
  },
  positionLabel: { fontSize: 13, fontWeight: 'bold', color: '#444', textAlign: 'center' },
  selectedLabel: { color: '#007AFF' },
  saveButton: {
    backgroundColor: '#28A745', 
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
