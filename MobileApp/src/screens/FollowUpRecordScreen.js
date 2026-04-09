import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import client from '../api/client';

export default function FollowUpRecordScreen({ route, navigation }) {
  const { patientId } = route.params;
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
    try {
      const response = await client.get(`/patients/${patientId}/positions`);
      setLogs(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
     fetchLogs();
  }, []);

  const renderLogItem = ({ item }) => {
    const d = new Date(item.changedAt);
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    const isMissed = item.isMissed;
    const color = isMissed ? '#E74C3C' : '#27AE60'; 

    return (
        <View style={styles.logCard}>
           <View style={styles.timelineContainer}>
              <Text style={styles.time}>{time}</Text>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <View style={styles.line} />
           </View>

           <View style={styles.logContent}>
              {isMissed ? (
                  <Text style={styles.missedText}>تنبيه تغيير وضعية لم يتم التأكيد</Text>
              ) : (
                  <>
                      <Text style={styles.actionText}>تم تغيير الوضعية</Text>
                      <Text style={styles.positionText}>{item.targetPosition}</Text>
                      <Text style={styles.byText}>بواسطة: {item.changedByInfo}</Text>
                  </>
              )}
           </View>
        </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
          <Text style={styles.backButtonText}>{"❮"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('follow_up_record')}</Text>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLogItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6' },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: { width: 40 },
  backButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  list: { paddingHorizontal: 20, paddingTop: 20 },
  logCard: { flexDirection: 'row', marginBottom: 20 },
  timelineContainer: { alignItems: 'center', width: 60, marginRight: 15 },
  time: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  dot: { width: 16, height: 16, borderRadius: 8, zIndex: 1 },
  line: { width: 2, flex: 1, backgroundColor: '#E0E0E0', marginTop: -5 },
  logContent: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 12, elevation: 1 },
  actionText: { fontSize: 14, color: '#333' },
  positionText: { fontSize: 16, fontWeight: 'bold', color: '#1E6C65', marginTop: 5 },
  byText: { fontSize: 12, color: '#888', marginTop: 10 },
  missedText: { fontSize: 14, color: '#E74C3C', fontWeight: 'bold' }
});
