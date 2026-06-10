import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { initNotificationChannel } from './src/services/notificationService';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    // 알림 채널 초기화 (Android)
    initNotificationChannel();

    // 알림 탭 시 쿠폰 상세로 이동 (추후 navigation ref로 연동)
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const couponId = response.notification.request.content.data?.couponId as string | undefined;
      if (couponId) {
        // TODO: navigationRef로 CouponDetail 이동
        console.log('알림 탭 → 쿠폰 ID:', couponId);
      }
    });
    return () => sub.remove();
  }, []);

  return <AppNavigator />;
}
