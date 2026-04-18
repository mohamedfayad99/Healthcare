import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, LogBox } from 'react-native';
import client from './client';

// Suppress the SDK 53 warning in the console/app UI
LogBox.ignoreLogs(['expo-notifications']);

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Safely registers for push notifications.
 * Skips remote registration if in Expo Go to avoid errors.
 */
export async function registerForPushNotifications() {
  if (Platform.OS === 'web') return null;

  // CHECK: If we are in Expo Go, we skip remote token registration
  // because SDK 53 removed it from Expo Go.
  const isExpoGo = Constants.appOwnership === 'expo';
  if (isExpoGo) {
    console.log('[Push] Running in Expo Go. Skipping remote token registration but local alerts will work.');
    
    // We still need permissions for LOCAL notifications
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('[Push] Permission for local notifications not granted');
    }
    return null;
  }

  if (!Device.isDevice) {
    console.log('[Push] Must use physical device for Push Notifications');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (e) {
    console.warn('[Push] Registration error:', e);
    return null;
  }
}

export async function sendTokenToBackend(token) {
  if (!token) return;
  try {
    await client.post('/devices/register', {
      token: token,
      platform: Platform.OS
    });
  } catch (error) {
    console.error('[Push] Backend register error:', error.message);
  }
}

/**
 * Schedules a LOCAL notification for 2 hours later.
 */
export async function schedulePositionChangeReminder(patientName, bedNumber) {
  try {
    const identifier = `reminder-${patientName}-${bedNumber}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);

    // Set to 7200 seconds (2 hours)
    const seconds = 7200; 
    
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ تنبيه: وقت تغيير الوضعية",
        body: `لقد مضى ساعتان على آخر تغيير. يرجى تغيير وضعية المريض: ${patientName} (سرير ${bedNumber})`,
        data: { patientName, bedNumber },
        sound: 'default',
        channelId: 'default',
      },
      trigger: {
        type: 'timeInterval', // Explicitly specify the trigger type
        seconds: seconds,
      },
      identifier: identifier
    });

    console.log(`[LocalPush] Scheduled 2-hour reminder for ${patientName}.`);
    return id;
  } catch (error) {
    console.error('[LocalPush] Schedule error:', error);
  }
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function addNotificationResponseListener(onTap) {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (onTap) onTap(data);
  });
  return () => sub.remove();
}
