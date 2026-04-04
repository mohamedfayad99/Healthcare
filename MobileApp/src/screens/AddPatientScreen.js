import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import client from '../api/client';

export default function AddPatientScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [department, setDepartment] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [mobilityStatus, setMobilityStatus] = useState('غير قادر على الحركة'); // default

  const handleSave = async () => {
    if (!fullName || !age || !department || !bedNumber) {
      Alert.alert('تنبيه', 'يرجى تعبئة جميع الحقول');
      return;
    }

    try {
      const response = await client.post('/patients', {
        fullName,
        age: parseInt(age, 10),
        department,
        bedNumber,
        mobilityStatus
      });

      if (response.status === 201) {
        Alert.alert('نجاح', 'تمت إضافة المريض بنجاح!');
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل في إضافة المريض.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>إضافة مريض جديد</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>اسم المريض</Text>
          <TextInput style={styles.input} placeholder="أدخل اسم المريض" value={fullName} onChangeText={setFullName} textAlign="right" />

          <Text style={styles.label}>العمر</Text>
          <TextInput style={styles.input} placeholder="أدخل العمر" value={age} onChangeText={setAge} keyboardType="numeric" textAlign="right" />

          <Text style={styles.label}>القسم</Text>
          <TextInput style={styles.input} placeholder="مثال: العناية المركزة" value={department} onChangeText={setDepartment} textAlign="right" />

          <Text style={styles.label}>رقم السرير</Text>
          <TextInput style={styles.input} placeholder="أدخل رقم السرير" value={bedNumber} onChangeText={setBedNumber} textAlign="right" />

          <Text style={styles.label}>حالة الحركة</Text>
          <TextInput style={styles.input} placeholder="حالة الحركة" value={mobilityStatus} onChangeText={setMobilityStatus} textAlign="right" />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>حفظ وإضافة</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6' },
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E6C65' },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 3 },
  label: { fontSize: 14, color: '#333', marginBottom: 5, textAlign: 'right', fontWeight: 'bold' },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  saveButton: { backgroundColor: '#1E6C65', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { marginTop: 15, alignItems: 'center', padding: 10 },
  cancelButtonText: { color: '#e74c3c', fontSize: 16, fontWeight: 'bold' }
});
