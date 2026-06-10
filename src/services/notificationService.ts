/**
 * notificationService.ts — expo-notifications 기반 (Expo 환경)
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Coupon } from '../types/coupon';
import { parseDateString } from '../utils/dateUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function initNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('coupon-alarm', {
      name: '쿠폰 만료 알림',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

export async function scheduleExpiryNotifications(coupon: Coupon): Promise<void> {
  await cancelCouponNotifications(coupon.id);

  const expiry = parseDateString(coupon.expiryDate);
  const offsets: { days: number; body: string }[] = [
    { days: 3, body: `${coupon.brand} ${coupon.title} 쿠폰이 3일 후 만료됩니다.` },
    { days: 1, body: `${coupon.brand} ${coupon.title} 쿠폰이 내일 만료됩니다.` },
    { days: 0, body: `오늘 만료되는 쿠폰이 있어요! ${coupon.brand} ${coupon.title}` },
  ];

  for (const { days, body } of offsets) {
    const triggerDate = new Date(expiry);
    triggerDate.setDate(triggerDate.getDate() - days);
    triggerDate.setHours(9, 0, 0, 0);
    if (triggerDate.getTime() > Date.now()) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${coupon.id}-d${days}`,
        content: {
          title: '쿠폰 만료 알림 🎫',
          body,
          data: { couponId: coupon.id },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
          channelId: 'coupon-alarm',
        },
      });
    }
  }
}

export async function cancelCouponNotifications(couponId: string): Promise<void> {
  for (const suffix of ['d0', 'd1', 'd3']) {
    try {
      await Notifications.cancelScheduledNotificationAsync(`${couponId}-${suffix}`);
    } catch {}
  }
}
