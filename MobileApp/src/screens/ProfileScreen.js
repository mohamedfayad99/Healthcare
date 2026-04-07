import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import client, { setAuthToken } from '../api/client';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await client.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching profile', error);
      Alert.alert('الجلسة منتهية', 'الرجاء تسجيل الدخول مجدداً لأن الجلسة فُقدت بسبب التحديث التلقائي');
      handleLogout();
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.profileContent}>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.role}>{user.role}</Text>

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
            <Text style={styles.detailValue}>{user.phoneNumber || '---'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#007AFF', padding: 20, paddingTop: 50,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  backBtn: { padding: 10, width: 80 },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  profileContent: { flex: 1, alignItems: 'center', marginTop: 40 },
  imageContainer: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', marginBottom: 20, backgroundColor: '#E0F0FF', elevation: 5 },
  image: { width: '100%', height: '100%' },
  placeholderImage: { flex: 1, backgroundColor: '#82C0FF', justifyContent: 'center', alignItems: 'center' },
  cameraIcon: { fontSize: 40, color: 'white' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#0050A0', marginBottom: 5 },
  role: { fontSize: 16, color: '#007AFF', marginBottom: 20 },
  detailsContainer: { width: '85%', backgroundColor: '#F0F8FF', borderRadius: 15, padding: 15, marginBottom: 30 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#E0F0FF' },
  detailLabel: { fontSize: 14, color: '#666' },
  detailValue: { fontSize: 14, fontWeight: 'bold', color: '#0050A0' },
  logoutBtn: { backgroundColor: '#e74c3c', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10, width: '80%', alignItems: 'center', borderWidth: 0 },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
