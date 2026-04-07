import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import client from '../api/client';

export default function PositionChangeScreen({ route, navigation }) {
  const { patientId, patientName, bedNumber } = route.params;
  const { t } = useTranslation();
  const [selectedPosition, setSelectedPosition] = useState(null);

  const positions = [
    { id: 'right_side', label: t('right_side'), icon: '🏃‍♂️' },
    { id: 'back', label: t('back'), icon: '🛌' },
    { id: 'left_side', label: t('left_side'), icon: '🏃‍♂️' },
    { id: 'sitting', label: t('sitting'), icon: '🪑' }
  ];

  const handleSavePosition = async () => {
    if (!selectedPosition) {
      Alert.alert(t('alert'), t('choose_suitable_position'));
      return;
    }

    try {
      const positionLabel = positions.find(p => p.id === selectedPosition).label;
      await client.post(`/patients/${patientId}/positions`, { targetPosition: positionLabel });
      Alert.alert(t('alert'), t('done_change'), [
        { text: 'OK', onPress: () => navigation.goBack() } 
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(t('alert'), 'Failed to save position');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('position_options')}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>اختر الوضعية المناسبة لتجنب قرح الفراش</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {positions.map(pos => (
          <TouchableOpacity 
            key={pos.id} 
            style={[styles.positionCard, selectedPosition === pos.id && styles.selectedCard]}
            onPress={() => setSelectedPosition(pos.id)}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.positionIcon}>{pos.icon}</Text>
            </View>
            <Text style={[styles.positionLabel, selectedPosition === pos.id && styles.selectedLabel]}>{pos.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSavePosition}>
        <Text style={styles.saveButtonText}>{t('done_change')}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: { padding: 10, width: 60 },
  backButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  infoBanner: {
    backgroundColor: '#E0F0FF',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  infoText: { color: '#0050A0', marginRight: 10, fontWeight: 'bold' },
  infoIcon: { fontSize: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  positionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#E0F0FF'
  },
  iconContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0F8FF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  positionIcon: { fontSize: 30 },
  positionLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  selectedLabel: { color: '#007AFF' },
  saveButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
