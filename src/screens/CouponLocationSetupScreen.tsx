/**
 * CouponLocationSetupScreen.tsx
 * 쿠폰 등록 후 → 위치 알림 설정 (STEP 3/3)
 * 와이어프레임 05번 화면
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Switch, ActivityIndicator, Platform, Dimensions,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Colors } from '../constants/colors';
import {
  requestLocationPermission, getCurrentLocation,
  startLocationTracking, saveLocationSettings,
  saveStoreLocations, getStoreLocations,
  type StoreLocation,
} from '../services/locationService';
import { getCouponById } from '../services/couponStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'CouponLocationSetup'>;

type Radius = 100 | 300 | 500 | 1000;
const RADIUS_OPTIONS: { value: Radius; label: string }[] = [
  { value: 100,  label: '100m' },
  { value: 500,  label: '500m' },
  { value: 1000, label: '1km'  },
];

export default function CouponLocationSetupScreen({ navigation, route }: Props) {
  const { couponId } = route.params;
  const mapRef = useRef<MapView>(null);

  const [locationOn,  setLocationOn]  = useState(false);
  const [radius,      setRadius]      = useState<Radius>(500);
  const [myLoc,       setMyLoc]       = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading,  setLocLoading]  = useState(false);
  const [storeName,   setStoreName]   = useState('');
  const [couponTitle, setCouponTitle] = useState('');

  // 쿠폰 정보 로드
  useEffect(() => {
    getCouponById(couponId).then(c => {
      if (c) {
        setStoreName(c.store || c.brand);
        setCouponTitle(c.title);
      }
    });
  }, [couponId]);

  // 위치 토글
  const handleToggle = async (val: boolean) => {
    if (val) {
      setLocLoading(true);
      const status = await requestLocationPermission();
      if (status === 'denied') {
        setLocLoading(false);
        return;
      }
      const loc = await getCurrentLocation();
      if (loc) {
        setMyLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        mapRef.current?.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }, 600);
      }
      setLocLoading(false);
    }
    setLocationOn(val);
  };

  // 등록 완료
  const handleComplete = async () => {
    if (locationOn) {
      // 위치 설정 저장
      await saveLocationSettings({ enabled: true, radius });
      await startLocationTracking();

      // 매장 위치 저장 (내 현재 위치를 임시 매장 위치로)
      if (myLoc) {
        const existing = await getStoreLocations();
        const newStore: StoreLocation = {
          couponId,
          storeName,
          couponTitle,
          latitude:  myLoc.lat,
          longitude: myLoc.lng,
        };
        const updated = existing.filter(s => s.couponId !== couponId);
        await saveStoreLocations([...updated, newStore]);
      }
    }

    navigation.replace('CouponSuccess', {
      couponId,
      locationEnabled: locationOn,
      radius: locationOn ? radius : undefined,
    });
  };

  const initialRegion = {
    latitude:      myLoc?.lat  ?? 37.5665,
    longitude:     myLoc?.lng  ?? 126.9780,
    latitudeDelta:  0.02,
    longitudeDelta: 0.02,
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>위치 알림</Text>
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>3/3</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* 타이틀 */}
        <Text style={styles.title}>매장 근처에서{'\n'}알림을 받을까요?</Text>
        <Text style={styles.sub}>사용 가능 매장 가까이 가면 자동으로 알려드려요.</Text>

        {/* 지도 */}
        <View style={styles.mapCard}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            showsUserLocation={locationOn}
            showsMyLocationButton={false}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            {myLoc && locationOn && (
              <>
                <Circle
                  center={{ latitude: myLoc.lat, longitude: myLoc.lng }}
                  radius={radius}
                  fillColor="rgba(255,91,74,0.1)"
                  strokeColor={Colors.coral}
                  strokeWidth={1.5}
                />
                <Marker
                  coordinate={{ latitude: myLoc.lat, longitude: myLoc.lng }}
                  pinColor={Colors.coral}
                  title={storeName}
                />
              </>
            )}
            {/* OFF일 때 샘플 마커 */}
            {!locationOn && (
              <>
                <Marker coordinate={{ latitude: 37.570, longitude: 126.975 }} pinColor={Colors.coral} />
                <Marker coordinate={{ latitude: 37.563, longitude: 126.983 }} pinColor={Colors.coral} />
                <Marker coordinate={{ latitude: 37.568, longitude: 126.990 }} pinColor="#BDBDBD" />
              </>
            )}
          </MapView>

          {locLoading && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color={Colors.coral} />
            </View>
          )}
        </View>

        {/* 위치 기반 알림 토글 */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIconBox, { backgroundColor: locationOn ? Colors.coralSoft : '#F0F0F0' }]}>
              <Text style={{ fontSize: 20 }}>📍</Text>
            </View>
            <View>
              <Text style={styles.toggleTitle}>위치 기반 알림</Text>
              <Text style={styles.toggleSub}>
                {locationOn ? `전국 ${storeName} 매장 부근` : '위치 알림 꺼짐'}
              </Text>
            </View>
          </View>
          <Switch
            value={locationOn}
            onValueChange={handleToggle}
            trackColor={{ false: '#E0E0E0', true: Colors.coralSoft }}
            thumbColor={locationOn ? Colors.coral : '#BDBDBD'}
            ios_backgroundColor="#E0E0E0"
          />
        </View>

        {/* 반경 선택 */}
        {locationOn && (
          <View style={styles.radiusSection}>
            <Text style={styles.radiusLabel}>알림 받을 거리</Text>
            <View style={styles.radiusRow}>
              {RADIUS_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.radiusBtn, radius === opt.value && styles.radiusBtnActive]}
                  onPress={() => setRadius(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.radiusBtnText, radius === opt.value && styles.radiusBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} activeOpacity={0.85}>
          <Text style={styles.completeBtnText}>이대로 등록하기</Text>
        </TouchableOpacity>
        {locationOn === false && (
          <Text style={styles.footerNote}>위치 알림 없이도 만료 알림은 정상 동작해요</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  backBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:   { fontSize: 22, fontWeight: '300', color: Colors.ink },
  headerTitle:{ flex: 1, fontSize: 17, fontWeight: '800', color: Colors.ink },
  stepBadge:  { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.navy, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.line },
  stepText:   { fontSize: 10, fontWeight: '700', color: Colors.background },

  body:  { flex: 1, paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.ink, lineHeight: 32, letterSpacing: -0.5 },
  sub:   { fontSize: 13, color: Colors.inkSoft, marginTop: -8 },

  /* 지도 */
  mapCard: {
    borderRadius: 16, borderWidth: 1.5, borderColor: Colors.line, overflow: 'hidden',
    shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  map: { height: 200 },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244,238,228,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* 토글 */
  toggleCard: {
    backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.line,
    padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  toggleLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIconBox:{ width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  toggleTitle:  { fontSize: 14, fontWeight: '800', color: Colors.ink },
  toggleSub:    { fontSize: 11, color: Colors.inkSoft, marginTop: 2 },

  /* 반경 */
  radiusSection: { gap: 10 },
  radiusLabel:   { fontSize: 11, letterSpacing: 1.5, fontWeight: '700', color: Colors.inkSoft },
  radiusRow:     { flexDirection: 'row', gap: 8 },
  radiusBtn:     { flex: 1, paddingVertical: 13, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.card, alignItems: 'center' },
  radiusBtnActive:    { backgroundColor: Colors.ink },
  radiusBtnText:      { fontSize: 14, fontWeight: '700', color: Colors.inkSoft },
  radiusBtnTextActive:{ color: Colors.background },

  /* 하단 */
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(26,26,26,0.08)',
    gap: 10,
  },
  completeBtn: {
    backgroundColor: Colors.ink, borderRadius: 12, borderWidth: 2, borderColor: Colors.line,
    paddingVertical: 17, alignItems: 'center',
    shadowColor: Colors.line, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  completeBtnText: { color: Colors.background, fontSize: 16, fontWeight: '800' },
  footerNote: { fontSize: 11, color: Colors.inkSoft, textAlign: 'center' },
});
