import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
// Notifications in Expo Go Android (SDK 53+) require a Development Build.
// We comment these out so you can test the UI in Expo Go without crashing.
// import * as Notifications from 'expo-notifications';
import i18n from './src/i18n/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import { RootSiblingParent } from 'react-native-root-siblings';

/* 
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
*/

export default function App() {
  useEffect(() => {
    /* 
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission for notifications not granted');
      }
    };
    requestPermissions();
    */
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
