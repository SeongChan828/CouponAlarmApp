/**
 * LocationAlertScreen.tsx
 * - 위치 기반 알림 ON/OFF 토글
 * - 알림 반경 선택 (100m / 300m / 500m / 1km)
 * - 내 위치 + 등록된 매장 지도 표시
 * - 각 매장까지의 거리 목록
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Switch, ActivityIndicator, Alert, Platform,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';
import {
  LocationSettings, StoreLocation,
  getLocationSettings, saveLocationSettings,
  requestLocationPermission, getCurrentLocation,
  startLocationTracking, stopLocationTracking,
  getStoreLocations, calcDistance, formatDistance,
} from '../services/locationService';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationAlert'>;

const RADIUS_OPTIONS: { value: LocationSettings['radius']; label: string }[] = [
  { value: 100,  label: '100m' },
  { value: 300,  label: '300m' },
  { value: 500,  label: '500m' },
  { value: 1000, label: '1km'  },
];

export default function LocationAlertScreen({ navigation }: Props) {
  const mapRef = useRef<MapView>(null);

  const [settings,  setSettings]  = useState<LocationSettings>({ enabled: false, radius: 500 });
  const [myLoc,     setMyLoc]     = useState<{ lat: number; lng: number } | null>(null);
  const [stores,    setStores]    = useState<StoreLocation[]>([]);
  const [locLoading, setLocLoading] = useState(false);
  const [permStatus, setPermStatus] = useState<'unknown' | 'granted' | 'background' | 'denied'>('unknown');

  /* ── 초기 로드 ── */
  useEffect(() => {
    (async () => {
      const s = await getLocationSettings();
      setSettings(s);
      const sl = await getStoreLocations();
      setStores(sl);
      await loadMyLocation();
    })();
  }, []);

  const loadMyLocation = async () => {
    setLocLoading(true);
    const loc = await getCurrentLocation();
    if (loc) setMyLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    setLocLoading(false);
  };

  /* ── 지도 내 위치로 이동 ── */
  useEffect(() => {
    if (myLoc && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: myLoc.lat,
        longitude: myLoc.lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 800);
    }
  }, [myLoc]);

  /* ── 위치 알림 토글 ── */
  const handleToggle = async (val: boolean) => {
    if (val) {
      // 켜기 → 권한 확인
      const status = await requestLocationPermission();
      setPermStatus(status);

      if (status === 'denied') {
        Alert.alert(
          '위치 권한 필요',
          '위치 기반 알림을 사용하려면 위치 권한을 허용해주세요.',
          [{ text: '확인' }],
        );
        return;
      }
      if (status === 'granted') {
        Alert.alert(
          '백그라운드 위치 권한 추천',
          '"항상 허용"으로 설정하면 앱이 꺼져 있어도 근처 매장 알림을 받을 수 있어요.',
          [{ text: '나중에' }, { text: '설정으로 이동', onPress: () => {} }],
        );
      }
      await startLocationTracking();
    } else {
      await stopLocationTracking();
    }

    const next = { ...settings, enabled: val };
    setSettings(next);
    await saveLocationSettings(next);
    if (val) await loadMyLocation();
  };

  /* ── 반경 변경 ── */
  const handleRadiusChange = async (r: LocationSettings['radius']) => {
    const next = { ...settings, radius: r };
    setSettings(next);
    await saveLocationSettings(next);
  };

  /* ── 매장까지 거리 계산 ── */
  const getDistToStore = (store: StoreLocation): number | null => {
    if (!myLoc) return null;
    return calcDistance(myLoc.lat, myLoc.lng, store.latitude, store.longitude);
  };

  /* ── 초기 지도 영역 ── */
  const initialRegion = myLoc
    ? { latitude: myLoc.lat, longitude: myLoc.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }
    : { latitude: 37.5665, longitude: 126.9780, latitudeDelta: 0.05, longitudeDelta: 0.05 }; // 서울 기본

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerEyebrow}>LOCATION</Text>
          <Text style={styles.headerTitle}>위치 기반 알림</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── ON/OFF 토글 카드 ── */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: settings.enabled ? Colors.coralSoft : '#F0F0F0' }]}>
              <Text style={styles.toggleIconText}>📍</Text>
            </View>
            <View>
              <Text style={styles.toggleTitle}>위치 기반 알림</Text>
              <Text style={styles.toggleSub}>
                {settings.enabled ? `반경 ${settings.radius >= 1000 ? '1km' : settings.radius + 'm'} 내 매장 감지 중` : '현재 꺼져 있어요'}
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggle}
            trackColor={{ false: '#E0E0E0', true: Colors.coralSoft }}
            thumbColor={settings.enabled ? Colors.coral : '#BDBDBD'}
            ios_backgroundColor="#E0E0E0"
          />
        </View>

        {/* ── 반경 선택 ── */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionLabel}>알림 받을 거리</Text>
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.radiusBtn,
                  settings.radius === opt.value && styles.radiusBtnActive,
                  !settings.enabled && styles.radiusBtnDisabled,
                ]}
                onPress={() => settings.enabled && handleRadiusChange(opt.value)}
                activeOpacity={settings.enabled ? 0.75 : 1}
              >
                <Text style={[
                  styles.radiusBtnText,
                  settings.radius === opt.value && styles.radiusBtnTextActive,
                  !settings.enabled && styles.radiusBtnTextDisabled,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── 지도 ── */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionLabel}>내 위치 & 등록 매장</Text>
            <TouchableOpacity onPress={loadMyLocation} style={styles.refreshBtn}>
              {locLoading
                ? <ActivityIndicator size="small" color={Colors.coral} />
                : <Text style={styles.refreshText}>새로고침</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.mapCard}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={initialRegion}
              showsUserLocation
              showsMyLocationButton={false}
            >
              {/* 내 위치 반경 원 */}
              {myLoc && settings.enabled && (
                <Circle
                  center={{ latitude: myLoc.lat, longitude: myLoc.lng }}
                  radius={settings.radius}
                  fillColor="rgba(255,91,74,0.12)"
                  strokeColor={Colors.coral}
                  strokeWidth={1.5}
                />
              )}

              {/* 매장 마커 */}
              {stores.map(store => (
                <Marker
                  key={store.couponId}
                  coordinate={{ latitude: store.latitude, longitude: store.longitude }}
                  title={store.storeName}
                  description={store.couponTitle}
                  pinColor={Colors.coral}
                />
              ))}
            </MapView>

            {/* 범례 */}
            <View style={styles.mapLegend}>
              {settings.enabled && (
                <View style={styles.legendItem}>
                  <View style={styles.legendCircle} />
                  <Text style={styles.legendText}>알림 반경</Text>
                </View>
              )}
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.coral }]} />
                <Text style={styles.legendText}>등록 매장</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 매장 거리 목록 ── */}
        {stores.length > 0 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionLabel}>등록된 매장까지 거리</Text>
            <View style={styles.storeList}>
              {stores.map(store => {
                const dist = getDistToStore(store);
                const inRange = dist !== null && settings.enabled && dist <= settings.radius;
                return (
                  <View key={store.couponId} style={[styles.storeRow, inRange && styles.storeRowActive]}>
                    <View style={[styles.storeDot, { backgroundColor: inRange ? Colors.coral : Colors.inkSoft }]} />
                    <View style={styles.storeInfo}>
                      <Text style={styles.storeName}>{store.storeName}</Text>
                      <Text style={styles.storeCoupon} numberOfLines={1}>{store.couponTitle}</Text>
                    </View>
                    <View style={styles.storeDistWrap}>
                      {dist !== null ? (
                        <>
                          <Text style={[styles.storeDist, inRange && styles.storeDistActive]}>
                            {formatDistance(dist)}
                          </Text>
                          {inRange && (
                            <View style={styles.nearBadge}>
                              <Text style={styles.nearBadgeText}>근처</Text>
                            </View>
                          )}
                        </>
                      ) : (
                        <Text style={styles.storeDistUnknown}>–</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── 매장 없을 때 ── */}
        {stores.length === 0 && (
          <View style={styles.emptyStores}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyTitle}>등록된 매장이 없어요</Text>
            <Text style={styles.emptySub}>쿠폰 등록 시 사용처의 위치를 추가하면{'\n'}근처 매장 알림을 받을 수 있어요.</Text>
          </View>
        )}

        {/* ── 안내 박스 ── */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>💡 위치 기반 알림이란?</Text>
          <Text style={styles.infoBoxText}>
            등록된 쿠폰의 사용처 근처를 지나갈 때 자동으로 알림을 드려요.{'\n'}
            "항상 허용"으로 설정하면 앱이 꺼진 상태에서도 작동해요.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.background },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  backBtn:       { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText:      { fontSize: 22, fontWeight: '300', color: Colors.ink },
  headerEyebrow: { fontSize: 9, letterSpacing: 2, color: Colors.coral, fontWeight: '700' },
  headerTitle:   { fontSize: 18, fontWeight: '800', color: Colors.ink },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },

  /* 토글 카드 */
  toggleCard: {
    backgroundColor: Colors.card,
    borderRadius: 16, borderWidth: 1.5, borderColor: Colors.line,
    padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  toggleLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIcon:     { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  toggleIconText: { fontSize: 20 },
  toggleTitle:    { fontSize: 15, fontWeight: '800', color: Colors.ink },
  toggleSub:      { fontSize: 11, color: Colors.inkSoft, marginTop: 2 },

  /* 섹션 */
  sectionWrap:     { gap: 10 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel:    { fontSize: 11, letterSpacing: 1.5, fontWeight: '700', color: Colors.coral },
  refreshBtn:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.card },
  refreshText:     { fontSize: 11, fontWeight: '700', color: Colors.inkSoft },

  /* 반경 선택 */
  radiusRow:            { flexDirection: 'row', gap: 8 },
  radiusBtn:            { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.card, alignItems: 'center' },
  radiusBtnActive:      { backgroundColor: Colors.ink, borderColor: Colors.line },
  radiusBtnDisabled:    { opacity: 0.4 },
  radiusBtnText:        { fontSize: 13, fontWeight: '700', color: Colors.inkSoft },
  radiusBtnTextActive:  { color: Colors.background },
  radiusBtnTextDisabled:{ color: Colors.inkSoft },

  /* 지도 */
  mapCard: {
    borderRadius: 16, borderWidth: 1.5, borderColor: Colors.line,
    overflow: 'hidden',
    shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  map:        { height: 280 },
  mapLegend:  { flexDirection: 'row', gap: 14, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: Colors.card },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: Colors.coral, backgroundColor: 'rgba(255,91,74,0.15)' },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: Colors.inkSoft, fontWeight: '500' },

  /* 매장 목록 */
  storeList:      { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.line, overflow: 'hidden' },
  storeRow:       { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(26,26,26,0.06)' },
  storeRowActive: { backgroundColor: Colors.coralSoft },
  storeDot:       { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  storeInfo:      { flex: 1 },
  storeName:      { fontSize: 13, fontWeight: '700', color: Colors.ink },
  storeCoupon:    { fontSize: 11, color: Colors.inkSoft, marginTop: 2 },
  storeDistWrap:  { alignItems: 'flex-end', gap: 4, flexShrink: 0 },
  storeDist:      { fontSize: 13, fontWeight: '700', color: Colors.inkSoft },
  storeDistActive:{ color: Colors.coral },
  storeDistUnknown: { fontSize: 13, color: Colors.inkSoft },
  nearBadge:      { backgroundColor: Colors.coral, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  nearBadgeText:  { fontSize: 9, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },

  /* 빈 매장 */
  emptyStores: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyIcon:   { fontSize: 40 },
  emptyTitle:  { fontSize: 15, fontWeight: '800', color: Colors.ink },
  emptySub:    { fontSize: 13, color: Colors.inkSoft, textAlign: 'center', lineHeight: 20 },

  /* 안내 박스 */
  infoBox: {
    backgroundColor: Colors.navy,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.line,
    padding: 16, gap: 8,
  },
  infoBoxTitle: { fontSize: 13, fontWeight: '800', color: Colors.white },
  infoBoxText:  { fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 19 },
});
