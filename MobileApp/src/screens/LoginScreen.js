import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import localApiService from '../api/localApiService';
import { setAuthToken } from '../api/client';
import { registerForPushNotifications, sendTokenToBackend } from '../api/notificationHelper';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      if (!username) {
        Alert.alert(t('alert'), t('enter_username'));
        return;
      }

      const response = await localApiService.login(username, password || 'dummy');
        setAuthToken(response.data.token);
        
        // Push Notification Registration
        try {
          const token = await registerForPushNotifications();
          if (token) {
            await sendTokenToBackend(token);
          }
        } catch (pushError) {
          console.log('[Login] Push registration skipped or failed:', pushError);
        }

        navigation.replace('Patients');
    } catch (error) {
      console.error(error);
      Alert.alert(t('alert'), 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="heart-pulse" size={45} color="white" />
          </View>
          <Text style={styles.title}>رعاية+</Text>
          <Text style={styles.subtitle}>متابعة أفضل - رعاية أفضل</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('login')}</Text>

          <Text style={styles.label}>{t('username')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enter_username')}
            value={username}
            onChangeText={setUsername}
            textAlign="right"
          />

          <Text style={styles.label}>{t('password')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enter_password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign="right"
          />

            <View style={styles.optionsRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.forgotPassword}>إنشاء حساب جديد</Text>
            </TouchableOpacity>
            <View style={styles.checkboxRow}>
              <Text style={styles.checkboxText}>{t('remember_me')}</Text>
              <View style={styles.checkbox} />
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>{t('login')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  forgotPassword: {
    color: '#007AFF',
    fontSize: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    marginRight: 10,
    color: '#333',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
