import axios from 'axios';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

let baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:5285/api' : 'http://localhost:5285/api';
// Try to grab your computer's actual Wi-Fi IP dynamically!
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.expoConfig?.extra?.debuggerHost;
if (debuggerHost) {
  const ip = debuggerHost.split(':')[0];
  baseURL = `http://${ip}:5285/api`;
}

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common['Authorization'];
  }
};

export default client;
