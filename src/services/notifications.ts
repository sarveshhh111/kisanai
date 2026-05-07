/**
 * Push Notification Service
 * - Web: silently skips (push notifications not available in browser)
 * - Native: requests Expo push token via expo-notifications
 */
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// Only configure handler on native (crashes on web)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // ─── Web: not supported, return null silently ────────────────────────────────
  if (Platform.OS === 'web') {
    console.log('[Web] Push notifications are not available on web. Skipping.');
    return null;
  }

  // ─── Android: create notification channel ───────────────────────────────────
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1A7A4A',
    });
  }

  // ─── Request permission ──────────────────────────────────────────────────────
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token: permission denied.');
      return null;
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
      return token;
    } catch (e) {
      console.error('Error generating push token:', e);
      return null;
    }
  } else {
    // Simulator — return a simulated token so the rest of the app works
    const simToken = 'SIMULATED_TOKEN_' + Date.now();
    console.log('Simulator detected — using simulated token:', simToken);
    return simToken;
  }
}
