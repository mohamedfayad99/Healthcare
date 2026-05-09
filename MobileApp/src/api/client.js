import axios from 'axios';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Backend runs on port 5286
const BACKEND_PORT = 5286;
const LAN_IP = '192.168.1.10'; // Your machine's Wi-Fi IP

let baseURL = Platform.OS === 'android' ? `http://10.0.2.2:${BACKEND_PORT}/api` : `http://localhost:${BACKEND_PORT}/api`;
// Try to grab your computer's actual Wi-Fi IP dynamically
const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.expoConfig?.extra?.debuggerHost;
if (debuggerHost) {
  const ip = debuggerHost.split(':')[0];
  baseURL = `http://${ip}:${BACKEND_PORT}/api`;
} else {
  // Fallback to hardcoded LAN IP for physical devices
  baseURL = `http://${LAN_IP}:${BACKEND_PORT}/api`;
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
