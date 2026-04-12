import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, SafeAreaView } from 'react-native';
import client from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { schedulePositionChangeReminder } from '../api/notificationHelper';

export default function AddPatientScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [department, setDepartment] = useState('');
  const [bedNumber, setBedNumber] = useState('');
  const [occupiedBeds, setOccupiedBeds] = useState([]);
  const [mobilityStatus, setMobilityStatus] = useState('غير قادر على الحركة'); 
  const [showBedPicker, setShowBedPicker] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);

  const departments = [
    { id: 'ICU', label: 'العناية المركزة (ICU)', icon: '🛏️' },
    { id: 'CCU', label: 'عناية القلب (CCU)', icon: '❤️' },
    { id: 'Neuro', label: 'عناية المخ والأعصاب (Neuro ICU)', icon: '🧠' },
    { id: 'Ward', label: 'القسم الداخلي (General Ward)', icon: '🛏️' },
    { id: 'Ortho', label: 'قسم العظام (Orthopedics Ward)', icon: '🦴' },
    { id: 'Surg', label: 'قسم الجراحة (Surgical Ward)', icon: '🔪' },
    { id: 'NICU', label: 'حضّانة الأطفال (NICU)', icon: '👶' },
    { id: 'Chest', label: 'قسم الصدر (Chest Ward)', icon: '🫁' },
    { id: 'Geri', label: 'رعاية كبار السن (Geriatric Ward)', icon: '🧓' },
    { id: 'Psych', label: 'الطب النفسي (Psychiatric Ward)', icon: '🧠' }
  ];

  useEffect(() => {
    fetchOccupiedBeds();
  }, []);

  const fetchOccupiedBeds = async () => {
    try {
      const res = await client.get('/api/beds/occupied');
      setOccupiedBeds(res.data.map(b => b.toString()));
    } catch (err) {
      console.error(err);
    }
  };

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
        // Schedule initial LOCAL notification for 2 hours later
        await schedulePositionChangeReminder(fullName, bedNumber);

        Alert.alert('نجاح', 'تمت إضافة المريض بنجاح!');
        navigation.goBack();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'فشل في إضافة المريض.');
    }
  };

  const renderBedSelection = () => {
    if (!showBedPicker) return (
      <TouchableOpacity 
        style={styles.dropdownTrigger} 
        onPress={() => setShowBedPicker(true)}
      >
        <Text style={styles.dropdownTriggerText}>
           {bedNumber ? `سرير رقم: ${bedNumber}` : 'اضغط لاختيار السرير'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>
    );

    const beds = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
    const availableBeds = beds.filter(num => !occupiedBeds.includes(num));

    return (
      <View style={styles.bedPickerCard}>
        <View style={styles.bedPickerHeader}>
           <Text style={styles.bedPickerTitle}>الأسرة المتاحة (1 - 30)</Text>
           <TouchableOpacity onPress={() => setShowBedPicker(false)}>
              <Text style={styles.closePickerText}>إغلاق</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.bedGrid}>
          {availableBeds.map(num => {
            const isSelected = bedNumber === num;
            
            return (
              <TouchableOpacity 
                key={num}
                onPress={() => {
                  setBedNumber(num);
                  setShowBedPicker(false);
                }}
                style={[
                  styles.bedItem,
                  isSelected && styles.bedSelected
                ]}
              >
                <Text style={[
                  styles.bedText,
                  isSelected && styles.bedTextSelected
                ]}>{num}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderDepartmentSelection = () => {
    if (!showDeptPicker) return (
      <TouchableOpacity 
        style={styles.dropdownTrigger} 
        onPress={() => setShowDeptPicker(true)}
      >
        <Text style={styles.dropdownTriggerText}>
           {department || 'اختر القسم'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>
    );

    return (
      <View style={styles.bedPickerCard}>
        <View style={styles.bedPickerHeader}>
           <Text style={styles.bedPickerTitle}>اختر القسم</Text>
           <TouchableOpacity onPress={() => setShowDeptPicker(false)}>
              <Text style={styles.closePickerText}>إغلاق</Text>
           </TouchableOpacity>
        </View>
        <ScrollView style={{maxHeight: 250}} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
          {departments.map(dept => (
            <TouchableOpacity 
              key={dept.id}
              onPress={() => {
                setDepartment(dept.label);
                setShowDeptPicker(false);
              }}
              style={[
                styles.deptItem,
                department === dept.label && styles.deptSelected
              ]}
            >
              <Text style={styles.deptIcon}>{dept.icon}</Text>
              <Text style={[
                styles.deptText,
                department === dept.label && styles.deptTextSelected
              ]}>{dept.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
           <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إضافة مريض جديد</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.label}>اسم المريض</Text>
            <TextInput style={styles.input} placeholder="أدخل اسم المريض" value={fullName} onChangeText={setFullName} textAlign="right" />

            <Text style={styles.label}>العمر</Text>
            <TextInput style={styles.input} placeholder="أدخل العمر" value={age} onChangeText={setAge} keyboardType="numeric" textAlign="right" />

            <Text style={styles.label}>القسم</Text>
            {renderDepartmentSelection()}

            <Text style={styles.label}>اختر السرير (1 - 30)</Text>
            {renderBedSelection()}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    backgroundColor: '#007AFF', padding: 20, paddingTop: 50, paddingBottom: 25,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 10
  },
  backButton: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  label: { fontSize: 14, color: '#333', marginBottom: 8, textAlign: 'right', fontWeight: 'bold' },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 15, marginBottom: 20, fontSize: 16 },
  saveButton: { backgroundColor: '#007AFF', borderRadius: 15, padding: 18, alignItems: 'center', marginTop: 10, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { marginTop: 15, alignItems: 'center', padding: 10 },
  cancelButtonText: { color: '#FF3B30', fontSize: 16, fontWeight: 'bold' },
  dropdownTrigger: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  dropdownTriggerText: { fontSize: 16, color: '#333' },
  bedPickerCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  bedPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center'
  },
  bedPickerTitle: { fontSize: 15, fontWeight: 'bold', color: '#007AFF' },
  closePickerText: { color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },
  bedGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start',
  },
  bedItem: { 
    width: '14%', 
    aspectRatio: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    margin: '1%', 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  bedSelected: { 
    backgroundColor: '#007AFF', 
    borderColor: '#0050A0' 
  },
  bedText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  bedTextSelected: { 
    color: '#fff' 
  },
  deptItem: {
    flexDirection: 'row-reverse',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  deptSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#0050A0'
  },
  deptIcon: { fontSize: 20, marginLeft: 10 },
  deptText: { fontSize: 16, color: '#333', fontWeight: '600' },
  deptTextSelected: { color: '#fff' }
});
