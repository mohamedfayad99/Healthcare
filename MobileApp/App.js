import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import { RootSiblingParent } from 'react-native-root-siblings';
import * as Notifications from 'expo-notifications';
import { addNotificationResponseListener } from './src/api/notificationHelper';

export default function App() {
  useEffect(() => {
    // Listen for notification responses (user tapping on a notification)
    const unsubscribe = addNotificationResponseListener((data) => {
      console.log('Notification tapped with data:', data);
      // Handle navigation or other actions based on data
    });

    return () => unsubscribe();
  }, []);

  return (
    <RootSiblingParent>
      <I18nextProvider i18n={i18n}>
        <AppNavigator />
        <StatusBar style="light" backgroundColor="#1E6C65" />
      </I18nextProvider>
    </RootSiblingParent>
  );
}
