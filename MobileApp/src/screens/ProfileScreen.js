import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import client, { setAuthToken } from '../api/client';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editedPhone, setEditedPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/auth/me');
      setUser(res.data);
      setEditedUsername(res.data.username);
      setEditedPhone(res.data.phoneNumber);
    } catch (error) {
      console.error('Error fetching profile', error);
      Alert.alert('الجلسة منتهية', 'الرجاء تسجيل الدخول مجدداً');
      handleLogout();
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await client.put('/auth/profile', {
        username: editedUsername,
        phoneNumber: editedPhone
      });
      setUser({ ...user, username: editedUsername, phoneNumber: editedPhone });
      setIsEditing(false);
      Alert.alert('نجاح', 'تم تحديث البيانات بنجاح');
    } catch (err) {
      console.error(err);
      Alert.alert('خطأ', 'فشل تحديث البيانات');
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      try {
        await client.put('/auth/profile-image', { imageBase64: base64Img });
        setUser({ ...user, profileImage: base64Img });
        Alert.alert('نجاح', 'تم تحديث الصورة بنجاح');
      } catch (err) {
        console.error(err);
        Alert.alert('خطأ', 'فشل تحديث الصورة');
      }
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (!user) {
    return <View style={styles.container}><Text>جاري التحميل...</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
           <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
        <TouchableOpacity 
          onPress={() => isEditing ? handleUpdateProfile() : setIsEditing(true)} 
          style={styles.editBtn}
        >
          <Text style={styles.editBtnText}>{isEditing ? 'حفظ' : 'تعديل'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.profileContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
               <Ionicons name="camera" size={40} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {isEditing ? (
          <TextInput 
            style={styles.inputEdit} 
            value={editedUsername} 
            onChangeText={setEditedUsername} 
            placeholder="اسم المستخدم"
          />
        ) : (
          <Text style={styles.username}>{user.username}</Text>
        )}
        <Text style={styles.role}>{user.role === 'Admin' ? 'مشرف ممرضين' : 'ممرض'}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>الرقم القومي</Text>
            <Text style={styles.detailValue}>{user.nationalId || '---'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>الجنس</Text>
            <Text style={styles.detailValue}>{user.gender === 'Male' ? 'ذكر' : 'أنثى'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>رقم الهاتف</Text>
            {isEditing ? (
              <TextInput 
                style={styles.inputEditSmall} 
                value={editedPhone} 
                onChangeText={setEditedPhone} 
                placeholder="رقم الهاتف"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.detailValue}>{user.phoneNumber || '---'}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab} onPress={() => {}}>
           <View style={styles.homeIconContainer}>
             <Ionicons name="person" size={24} color="#fff" />
          </View>
          <Text style={styles.footerTextActive}>الحساب</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerTab} onPress={() => navigation.navigate('Patients')}>
          <Ionicons name="home-outline" size={24} color="#8E8E93" />
          <Text style={styles.footerText}>الرئيسية</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerTab} onPress={() => navigation.navigate('AddPatient')}>
          <Ionicons name="add-circle-outline" size={24} color="#8E8E93" />
          <Text style={styles.footerText}>إضافة</Text>
        </TouchableOpacity>
      </View>
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
  backBtn: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  profileContent: { alignItems: 'center', paddingBottom: 100 },
  imageContainer: { 
    width: 130, height: 130, borderRadius: 65, overflow: 'hidden', 
    marginTop: 30, marginBottom: 15, backgroundColor: '#E0F0FF', 
    borderWidth: 4, borderColor: '#fff', elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 8
  },
  image: { width: '100%', height: '100%' },
  placeholderImage: { flex: 1, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  username: { fontSize: 26, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 5 },
  role: { fontSize: 16, color: '#007AFF', marginBottom: 30, fontWeight: '600' },
  detailsContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  detailItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  detailLabel: { fontSize: 14, color: '#8E8E93' },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: '#1C1C1E' },
  logoutBtn: { backgroundColor: '#FF3B30', flexDirection: 'row-reverse', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, width: '90%', alignItems: 'center', marginTop: 30, justifyContent: 'center' },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  aboutBtn: { 
    flexDirection: 'row-reverse', 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 15, 
    width: '90%', 
    alignItems: 'center', 
    marginTop: 20, 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  aboutText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  editBtnText: { color: '#fff', fontWeight: 'bold' },
  inputEdit: { 
    fontSize: 22, fontWeight: 'bold', color: '#007AFF', 
    borderBottomWidth: 2, borderBottomColor: '#007AFF',
    marginBottom: 5, textAlign: 'center', width: '80%'
  },
  inputEditSmall: {
    fontSize: 14, color: '#007AFF', borderBottomWidth: 1, borderBottomColor: '#007AFF',
    padding: 0, width: 150, textAlign: 'right'
  },
  footer: {
    position: 'absolute', bottom: 25, left: 20, right: 20, backgroundColor: '#fff',
    height: 70, borderRadius: 25, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, paddingHorizontal: 10
  },
  footerTab: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  footerIcon: { fontSize: 22, color: '#8E8E93', marginBottom: 4 },
  footerIconHome: { fontSize: 24, color: '#fff' },
  homeIconContainer: {
    width: 48, height: 48, backgroundColor: '#007AFF', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: -15, marginTop: -30,
    borderWidth: 5, borderColor: '#F8F9FB', shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  footerText: { fontSize: 10, color: '#8E8E93', fontWeight: '500' },
  footerTextActive: { fontSize: 10, color: '#007AFF', fontWeight: '700', marginTop: 15 }
});
