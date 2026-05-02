import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import { RootSiblingParent } from 'react-native-root-siblings';
import * as Notifications from 'expo-notifications';
import { addNotificationResponseListener } from './src/api/notificationHelper';

import { initDatabase } from './src/api/database';

export default function App() {
  useEffect(() => {
    // Initialize Local Database
    initDatabase()
      .then(() => console.log('Database Ready'))
      .catch(err => console.error('Database Init Error:', err));

    // Clear all stale notifications on startup once to ensure old test messages are gone
    Notifications.cancelAllScheduledNotificationsAsync()
      .then(() => console.log('Stale notifications cleared'))
      .catch(err => console.error('Error clearing notifications:', err));

    // Listen for notification responses
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
