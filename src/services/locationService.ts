/**
 * locationService.ts
 * expo-location + expo-task-manager 기반
 * - 현재 위치 조회
 * - 백그라운드 위치 추적
 * - 매장 근접 시 알림 발송
 */
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCATION_TASK = 'background-location-task';
const LOCATION_SETTINGS_KEY = '@location_settings';

/* ── 설정 타입 ── */
export type LocationSettings = {
  enabled: boolean;
  radius: 100 | 300 | 500 | 1000; // 미터
};

export type StoreLocation = {
  couponId: string;
  storeName: string;
  couponTitle: string;
  latitude: number;
  longitude: number;
};

/* ── 설정 저장/불러오기 ── */
export async function getLocationSettings(): Promise<LocationSettings> {
  try {
    const raw = await AsyncStorage.getItem(LOCATION_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabled: false, radius: 500 };
}

export async function saveLocationSettings(settings: LocationSettings): Promise<void> {
  await AsyncStorage.setItem(LOCATION_SETTINGS_KEY, JSON.stringify(settings));
}

/* ── 권한 요청 ── */
export async function requestLocationPermission(): Promise<'granted' | 'denied' | 'background'> {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') return 'denied';

  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  if (bg !== 'granted') return 'granted'; // 포그라운드만

  return 'background';
}

/* ── 현재 위치 조회 ── */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    return null;
  }
}

/* ── 두 좌표 사이 거리 계산 (미터) — Haversine ── */
export function calcDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── 거리 포맷 ── */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/* ── 백그라운드 위치 태스크 정의 ── */
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: any) => {
  if (error) return;
  if (!data) return;

  const { locations } = data as { locations: Location.LocationObject[] };
  const loc = locations[0];
  if (!loc) return;

  const settings = await getLocationSettings();
  if (!settings.enabled) return;

  // 저장된 매장 위치 목록 불러오기
  const raw = await AsyncStorage.getItem('@store_locations');
  if (!raw) return;
  const stores: StoreLocation[] = JSON.parse(raw);

  for (const store of stores) {
    const dist = calcDistance(
      loc.coords.latitude, loc.coords.longitude,
      store.latitude, store.longitude,
    );
    if (dist <= settings.radius) {
      // 쿨다운 체크 (같은 매장 알림 1시간에 1번)
      const coolKey = `@notif_cool_${store.couponId}`;
      const lastNotif = await AsyncStorage.getItem(coolKey);
      if (lastNotif && Date.now() - Number(lastNotif) < 3600_000) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `📍 ${store.storeName} 근처예요!`,
          body: `${store.couponTitle} 쿠폰을 사용할 수 있어요. (${formatDistance(dist)} 거리)`,
          data: { couponId: store.couponId },
        },
        trigger: null, // 즉시 발송
      });
      await AsyncStorage.setItem(coolKey, String(Date.now()));
    }
  }
});

/* ── 백그라운드 위치 추적 시작 ── */
export async function startLocationTracking(): Promise<boolean> {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
    if (isRunning) return true;

    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 100, // 100m 이동마다 업데이트
      timeInterval: 60_000,  // 최소 1분 간격
      foregroundService: {
        notificationTitle: '쿠폰 알림 앱',
        notificationBody: '근처 매장 쿠폰을 확인 중이에요',
        notificationColor: '#FF5B4A',
      },
      pausesUpdatesAutomatically: true,
    });
    return true;
  } catch {
    return false;
  }
}

/* ── 백그라운드 위치 추적 중지 ── */
export async function stopLocationTracking(): Promise<void> {
  try {
    const isRunning = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK);
    if (isRunning) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  } catch {}
}

/* ── 매장 위치 목록 저장 ── */
export async function saveStoreLocations(stores: StoreLocation[]): Promise<void> {
  await AsyncStorage.setItem('@store_locations', JSON.stringify(stores));
}

export async function getStoreLocations(): Promise<StoreLocation[]> {
  try {
    const raw = await AsyncStorage.getItem('@store_locations');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
