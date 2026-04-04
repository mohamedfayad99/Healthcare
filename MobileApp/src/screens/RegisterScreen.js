import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import client from '../api/client';

export default function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Nurse');

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert(t('alert'), t('enter_username') || 'Please enter username and password');
      return;
    }

    try {
      const response = await client.post('/auth/register', { username, password, role });
      if (response.data) {
        Alert.alert('Success', 'Account created successfully!');
        navigation.replace('Login');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('alert'), 'Failed to create account or username already exists.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>📝</Text>
          </View>
          <Text style={styles.title}>إنشاء حساب جديد</Text>
          <Text style={styles.subtitle}>مساعد العناية بالمرضى</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>التسجيل</Text>

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

          <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
            <Text style={styles.loginButtonText}>إنشاء الحساب</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
            <Text style={styles.linkButtonText}>العودة لتسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7F6' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1E6C65', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logoText: { fontSize: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#7f8c8d' },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  label: { fontSize: 14, color: '#333', marginBottom: 5, textAlign: 'right' },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  loginButton: { backgroundColor: '#1E6C65', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkButton: { marginTop: 15, alignItems: 'center' },
  linkButtonText: { color: '#1E6C65', fontSize: 14 }
});
