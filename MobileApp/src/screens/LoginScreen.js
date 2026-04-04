import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import client, { setAuthToken } from '../api/client';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('hamid');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      if (!username) {
        Alert.alert(t('alert'), t('enter_username'));
        return;
      }

      const response = await client.post('/auth/login', { username, password: password || 'dummy' });
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        navigation.replace('Patients');
      }
    } catch (error) {
      console.error(error);
      Alert.alert(t('alert'), 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>❤️</Text>
        </View>
        <Text style={styles.title}>مساعد العناية بالمرضى</Text>
        <Text style={styles.subtitle}>متابعة وتنبيه تغيير وضعية المرضى</Text>
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
          <Text style={styles.forgotPassword}>{t('forgot_password')}</Text>
          <View style={styles.checkboxRow}>
            <Text style={styles.checkboxText}>{t('remember_me')}</Text>
            <View style={styles.checkbox} />
          </View>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>{t('login')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E6C65',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
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
    color: '#1E6C65',
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
    backgroundColor: '#1E6C65',
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
