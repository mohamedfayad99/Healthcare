import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView, Image, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import localApiService from '../api/localApiService';
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [gender, setGender] = useState('Male');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [role, setRole] = useState('Nurse');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true
    });
    if (!result.canceled && result.assets[0].base64) {
      setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword || !nationalId || !phoneNumber) {
      Alert.alert(t('alert'), 'يرجى إدخال جميع الحقول المطلوبة');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('alert'), 'كلمة المرور غير متطابقة');
      return;
    }

    try {
      const payload = { username, password, role, profileImage, nationalId, gender, phoneNumber };
      const response = await localApiService.register(payload);
      if (response.data) {
        Alert.alert('نجاح', 'تم إنشاء الحساب بنجاح!', [{ text: 'دخول', onPress: () => navigation.replace('Login') }]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('alert'), 'Failed to create account or username already exists.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.simpleHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>❮</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
               <MaterialCommunityIcons name="heart-pulse" size={35} color="white" />
            </View>
            <Text style={styles.title}>رعاية+</Text>
            <Text style={styles.subtitle}>متابعة أفضل - رعاية أفضل</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>التسجيل</Text>
            
            <TouchableOpacity onPress={pickImage} style={styles.imagePickerContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.cameraIcon}>📷</Text>
                  <Text style={{color: '#fff', fontSize: 10, marginTop: 5}}>أضف صورة</Text>
                </View>
              )}
            </TouchableOpacity>

          <Text style={styles.label}>{t('username') || 'اسم المستخدم'}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enter_username') || 'أدخل اسم المستخدم'}
            value={username}
            onChangeText={setUsername}
            textAlign="right"
          />

          <Text style={styles.label}>{t('password') || 'كلمة المرور'}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enter_password') || 'أدخل كلمة المرور'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign="right"
          />

          <Text style={styles.label}>تأكيد كلمة المرور</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل كلمة المرور مجدداً"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textAlign="right"
          />

          <Text style={styles.label}>الرقم القومي</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل الرقم القومي"
            value={nationalId}
            onChangeText={setNationalId}
            keyboardType="number-pad"
            textAlign="right"
          />

          <Text style={styles.label}>رقم الهاتف</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل رقم الهاتف"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            textAlign="right"
          />

          <Text style={styles.label}>الجنس</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity 
              style={[styles.genderButton, gender === 'Male' && styles.genderSelected]} 
              onPress={() => setGender('Male')}
            >
              <Text style={[styles.genderText, gender === 'Male' && styles.genderTextSelected]}>ذكر</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.genderButton, gender === 'Female' && styles.genderSelected]} 
              onPress={() => setGender('Female')}
            >
              <Text style={[styles.genderText, gender === 'Female' && styles.genderTextSelected]}>أنثى</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
            <Text style={styles.loginButtonText}>إنشاء الحساب</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
            <Text style={styles.linkButtonText}>العودة لتسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  simpleHeader: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: 'transparent'
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { color: '#007AFF', fontSize: 24, fontWeight: 'bold' },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: 20, paddingBottom: 50 },
  logoContainer: { alignItems: 'center', marginBottom: 25 },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 5
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#003366', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#007AFF', fontWeight: '500' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  imagePickerContainer: { alignSelf: 'center', marginBottom: 20 },
  previewImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 0 },
  placeholderImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F0FF', justifyContent: 'center', alignItems: 'center', borderWidth: 0 },
  cameraIcon: { fontSize: 24, color: '#007AFF' },
  label: { fontSize: 13, color: '#666', marginBottom: 5, textAlign: 'right' },
  input: { backgroundColor: '#F0F8FF', borderRadius: 10, padding: 14, marginBottom: 15, fontSize: 16, borderWidth: 0 },
  genderContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  genderButton: { flex: 0.48, padding: 12, borderRadius: 10, backgroundColor: '#F0F8FF', alignItems: 'center' },
  genderSelected: { backgroundColor: '#007AFF' },
  genderText: { color: '#007AFF', fontWeight: 'bold' },
  genderTextSelected: { color: '#fff' },
  loginButton: { backgroundColor: '#007AFF', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 10, elevation: 2, borderWidth: 0 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkButtonText: { color: '#007AFF', fontSize: 14, fontWeight: '500' }
});
